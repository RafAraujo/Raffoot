using HtmlAgilityPack;
using RaffootLoader.Application.DTO;
using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.FM;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Infrastructure.CrossCutting.Utils;
using RaffootLoader.Infrastructure.Data;
using System.Diagnostics;
using System.Text;

namespace RaffootLoader.Application.Services.DataExtractors.FM
{
    public class FmInsideDataExtractorService(
        IHtmlDocumentService htmlDocumentService,
        IHttpClientWebScraper webScraper,
        ISettings settings) : IFmInsideDataExtractorService
    {
        private const string BaseUrl = "https://fminside.net/";
        private readonly string dbPath = string.Concat(settings.DbPath, ".temp");

        private Repository repository;

        public async Task<DatabaseDto> GetDatabaseDto()
        {
            var database = new DatabaseDto();

            try
            {
                var customSettings = new Settings(settings.GameBaseFolder, settings.ConsoleAppFolder, $"{settings.DbPath}.temp");
                repository = new(customSettings);

                await ResumeProcessing().ConfigureAwait(false);

                database.Year = settings.Year;
                database.Clubs = GetEntitiesWithoutId<Club>();
                database.Players = GetEntitiesWithoutId<Player>();
                database.Countries = GetEntitiesWithoutId<Country>();
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception)
            {
                File.Move(dbPath, string.Concat(dbPath, ".error"));
                throw;
            }

            return database;
        }

        private async Task CreateDatabaseIfNotExists()
        {
            if (!File.Exists(dbPath))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(dbPath));
                Console.WriteLine("Reading HTML file...");
                var filePath = Path.Combine(settings.HtmlFolder, "World.html");
                var doc = await GetHtmlDocument(filePath).ConfigureAwait(false);

                Console.WriteLine("Getting clubs...");
                var clubs = GetClubs(doc);
                repository.InsertMany(clubs);
            }
        }

        public static async Task<HtmlDocument> GetHtmlDocument(string filePath)
        {
            var html = await File.ReadAllTextAsync(filePath).ConfigureAwait(false);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            return doc;
        }

        private async Task ResumeProcessing()
        {
            await CreateDatabaseIfNotExists().ConfigureAwait(false);

            var clubs = repository.GetAll<Club>().ToList();
            var pendingClubs = clubs.Where(c => !c.IsProcessingFinished).ToList();

            var current = clubs.Count - pendingClubs.Count;

            foreach (var club in pendingClubs)
            {
                ConsoleUtils.ShowProgress(++current, clubs.Count, $"Getting {club.Name} players: ");

                var players = await GetPlayers(club).ConfigureAwait(false);

                repository.InsertMany(players);
                club.IsProcessingFinished = true;
                repository.Update(club);

                if (current % 80 == 0)
                {
                    var cancel = CheckForCancellation();
                    if (cancel)
                        throw new OperationCanceledException();
                }
            }

            ConsoleUtils.ShowProgress(current, clubs.Count, $"Players: ");

            Console.WriteLine("\nRemoving duplicate players...");
            RemoveDuplicatePlayers();
        }

        private static bool CheckForCancellation()
        {
            Console.WriteLine("\nCancel? [y/n]");

            var stopwatch = Stopwatch.StartNew();
            var sb = new StringBuilder();

            while (stopwatch.Elapsed < TimeSpan.FromSeconds(5))
            {
                if (Console.KeyAvailable)
                {
                    var key = Console.ReadKey();
                    if (key.Key == ConsoleKey.Enter)
                    {
                        Console.WriteLine();
                        return sb.ToString().Equals("y", StringComparison.CurrentCultureIgnoreCase);
                    }
                    sb.Append(key.KeyChar);
                }
                Thread.Sleep(TimeSpan.FromMilliseconds(50));
            }

            Console.WriteLine();
            return false;
        }

        private static List<Club> GetClubs(HtmlDocument doc)
        {
            var clubs = new List<Club>();

            var ulList = doc.DocumentNode.SelectNodes("//div[@id='club_table']//div[contains(@class, 'clubs')]//ul[contains(@class, 'club')]");

            foreach (var ul in ulList)
            {
                var spanLogo = ul.SelectSingleNode("./li[contains(@class, 'club')]/span[contains(@class, 'image')]");
                var linkName = ul.SelectSingleNode("./li[contains(@class, 'club')]/span[contains(@class, 'name')]/b/a");
                var liLeague = ul.SelectSingleNode("./li[contains(@class, 'league')]");

                var logo = string.Format("https://{0}", spanLogo.GetAttributeValue("style", default(string)).Split(' ')[1][6..].TrimEnd(')'));
                var externalId = int.Parse(Path.GetFileNameWithoutExtension(logo));

                if (clubs.Any(c => c.ExternalId == externalId))
                    continue;

                var club = new Club
                {
                    ExternalId = externalId,
                    Name = linkName.InnerText,
                    Logo = logo,
                    Link = new Uri(new Uri(BaseUrl), linkName.GetAttributeValue("href", default(string))).ToString(),
                };

                clubs.Add(club);
            }

            return clubs;
        }

        private async Task<List<Player>> GetPlayers(Club club)
        {
            var players = new List<Player>();

            var doc = await htmlDocumentService.GetHtmlDocument(club, club.Link, webScraper).ConfigureAwait(false);

            var liListClubInfo = doc.DocumentNode.SelectNodes("//div[@id='club_info']/div[@id='club']//ul[1]/li");
            var country = liListClubInfo[4].SelectSingleNode("./span[contains(@class, 'value')]").InnerText;
            var status = liListClubInfo[7].SelectSingleNode("./span[contains(@class, 'value')]").InnerText;

            club.Country = country;
            club.Status = status;

            var nodesFullSquad = doc.DocumentNode.SelectNodes("(//div[@id='player_table'][.//h2[text()='Full Squad']])//ul[contains(@class, 'player')]");
            if (nodesFullSquad == null)
                return players;

            var onLoan = new List<Player>();
            var nodesOnLoan = doc.DocumentNode.SelectNodes("(//div[@id='player_table'][.//h2[text()='On loan']])//ul[contains(@class, 'player')]");
            if (nodesOnLoan != null)
                onLoan = GetPlayers(nodesOnLoan, club);

            var fullSquad = GetPlayers(nodesFullSquad, club);

            foreach (var player in fullSquad)
                if (onLoan.Any(p => player.ExternalId == p.ExternalId))
                    player.OnLoan = true;

            players.AddRange(fullSquad);

            return players;
        }

        private List<Player> GetPlayers(HtmlNodeCollection nodes, Club club)
        {
            var players = new List<Player>();

            foreach (var node in nodes)
            {
                var spanOverall = node.SelectSingleNode("./li[contains(@class, 'rating')]/span");
                var imgPhoto = node.SelectSingleNode("./li[contains(@class, 'player')]/span[contains(@class, 'image')]/img");
                var spanName = node.SelectSingleNode("./li[contains(@class, 'player')]/span[contains(@class, 'name')]");
                var imgCountry = spanName.SelectSingleNode("./b/img");
                var linkName = spanName.SelectSingleNode("./b/a");
                var spansPositions = spanName.SelectNodes("./span[contains(@class, 'desktop_positions')]/span[contains(@class, 'position') and contains(@class, 'natural')]");
                var liAge = node.SelectSingleNode("./li[contains(@class, 'age')]");

                var linkNameHref = Path.GetFileNameWithoutExtension(linkName.GetAttributeValue("href", default(string)));
                var externalId = int.Parse(linkNameHref[..linkNameHref.IndexOf('-')]);

                var photo = string.Format("{0}{1}", "https://", imgPhoto.GetAttributeValue("src", default(string)).TrimStart([.. "//"]));
                if (Path.GetFileNameWithoutExtension(photo) == "default-2020")
                    photo = null;

                var player = new Player
                {
                    ExternalId = externalId,
                    Name = linkName.InnerText,
                    FullName = linkName.InnerText,
                    Age = int.Parse(liAge.InnerText),
                    Country = imgCountry.GetAttributeValue("code", default(string)),
                    ClubId = club.ExternalId,
                    Positions = [.. spansPositions.Select(s => GetStandardizedPositionAbbreviation(s.InnerText))],
                    Overall = int.Parse(spanOverall.InnerText),
                    Potential = int.Parse(spanOverall.InnerText),
                    Photo = photo,
                };

                var countries = repository.GetAll<Country>();
                if (!countries.Any(c => c.Name == player.Country) && !string.IsNullOrEmpty(player.Country))
                {
                    var flag = string.Format("{0}{1}", "https://", imgCountry.GetAttributeValue("src", default(string)).TrimStart([.. "//"]));
                    repository.Insert(new Country(player.Country, flag, null));
                }

                players.Add(player);
            }

            return players;
        }

        private void RemoveDuplicatePlayers()
        {
            var players = repository.GetAll<Player>();

            var groupedByExternalId = players.GroupBy(p => p.ExternalId).Where(g => g.Count() > 1);
            foreach (var group in groupedByExternalId)
            {
                var player = group.Single(p => !p.OnLoan);
                repository.Delete<Player>(player.Id);
            }
        }

        private static string GetStandardizedPositionAbbreviation(string position)
        {
            return position switch
            {
                "DC" => "CB",
                "DR" => "RB",
                "DL" => "LB",
                "WBR" => "RWB",
                "WBL" => "LWB",
                "DM" => "CDM",
                "MC" or "MCR" or "MCL" => "CM",
                "MR" => "RM",
                "ML" => "LM",
                "AMC" => "CAM",
                "AMR" => "RW",
                "AML" => "LW",
                _ => position,
            };
        }

        private List<T> GetEntitiesWithoutId<T>() where T : Entity
        {
            var entities = repository.GetAll<T>();
            foreach (var entity in entities)
                entity.Id = 0;
            return entities;
        }
    }
}
