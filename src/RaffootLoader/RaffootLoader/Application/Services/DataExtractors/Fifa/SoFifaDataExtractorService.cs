using HtmlAgilityPack;
using RaffootLoader.Application.DTO;
using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.Fifa;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Application.Services.Abstract;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Infrastructure.CrossCutting.Utils;

namespace RaffootLoader.Application.Services.DataExtractors.Fifa
{
    public class SoFifaDataExtractorService(
        IHtmlDocumentService htmlDocumentService,
        IPuppeteerWebScraper webScraper,
        ISettings settings) : FifaService, ISoFifaDataExtractorService
    {
        private const string BaseUrl = "https://sofifa.com/";

        private List<Country> countries = [];

        public async Task<DatabaseDto> GetDatabaseDto()
        {
            var database = new DatabaseDto();

            var leagues = GetLeagues();
            var roster = await GetRoster(leagues).ConfigureAwait(false);
            var clubs = await GetClubs(leagues, roster).ConfigureAwait(false);
            var players = await GetPlayers(leagues, clubs, roster).ConfigureAwait(false);
            countries = [.. countries.OrderBy(c => c.Name)];

            database.Year = settings.Year;
            database.Clubs = clubs;
            database.Players = players;
            database.Countries = countries;

            return database;
        }

        private async Task<int> GetRoster(List<League> leagues)
        {
            List<DateTime> dates = [];

            var league = leagues.Single(l => l.Country == "England" && l.Division == 1);
            var url = GetLeagueUrl(league, 1);
            var doc = await htmlDocumentService.GetHtmlDocument(league, url, webScraper).ConfigureAwait(false);

            var options = doc.DocumentNode.SelectNodes("//select[@name='roster']/option");
            foreach (var option in options)
                if (DateTime.TryParse(option.InnerText, out DateTime value))
                    dates.Add(value.Date);

            dates = [.. dates.OrderBy(d => d)];
            var date = dates.LastOrDefault(d => d.Year == settings.Year - 1);
            var roster = dates.IndexOf(date);

            return roster == -1 ? 1 : roster + 1;
        }

        private async Task<List<Club>> GetClubs(List<League> leagues, int roster)
        {
            var clubs = new List<Club>();

            var current = 0;

            foreach (var league in leagues)
            {
                ConsoleUtils.ShowProgress(++current, leagues.Count, $"Getting {league.Country} clubs: ");

                var url = GetLeagueUrl(league, roster);
                var doc = await htmlDocumentService.GetHtmlDocument(league, url, webScraper).ConfigureAwait(false);

                var divs = doc.DocumentNode.SelectNodes("//div[@id='similar']/div");
                if (divs == null)
                    continue;

                foreach (var div in divs)
                {
                    var link = div.SelectSingleNode(".//a[2]");
                    var club = new Club
                    {
                        ExternalId = int.Parse(link.GetAttributeValue("href", default(string)).Split("/")[2]),
                        Name = link.InnerText,
                        Country = league.Country,
                    };
                    clubs.Add(club);
                }
            }

            ConsoleUtils.ShowProgress(current, leagues.Count, $"Clubs: ");

            return clubs;
        }

        private string GetLeagueUrl(League league, int roster = 1) => $"{BaseUrl}league/{league.ExternalId}?r={settings.Year.ToString()[2..]}{roster:0000}&set=true";

        private async Task<List<Player>> GetPlayers(List<League> leagues, List<Club> clubs, int roster)
        {
            var players = new List<Player>();

            var current = 0;
            Console.WriteLine();

            foreach (var club in clubs)
            {
                ConsoleUtils.ShowProgress(++current, clubs.Count, $"Getting {club.Name} players: ");

                var url = $"{BaseUrl}{"team/"}{club.ExternalId}?r={settings.Year.ToString()[2..]}{roster:0000}&set=true";
                var doc = await htmlDocumentService.GetHtmlDocument(club, url, webScraper).ConfigureAwait(false);

                var clubPlayers = GetPlayers(doc, leagues);

                foreach (var player in clubPlayers)
                    player.ClubId = club.ExternalId;

                players.AddRange(clubPlayers);

                club.Logo = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'profile')]/img").GetAttributeValue("data-srcset", default(string));
                club.Kits = GetKits(doc);
            }

            ConsoleUtils.ShowProgress(current, clubs.Count, $"Players: ");
            Console.WriteLine();

            return players;
        }

        private static List<string> GetKits(HtmlDocument doc)
        {
            var kits = new List<string>();

            var aside = doc.DocumentNode.Descendants().First(n => n.Name == "aside");
            foreach (var div in aside.Descendants().Where(n => n.Name == "div" && n.HasClass("grid")).TakeLast(2))
                foreach (var innerDiv in div.Descendants().Where(n => n.Name == "div" && !string.IsNullOrEmpty(n.InnerHtml)))
                    kits.Add(innerDiv.Descendants().First(n => n.Name == "img").GetAttributeValue("data-srcset", default(string)));

            return kits;
        }

        private List<Player> GetPlayers(HtmlDocument doc, List<League> leagues)
        {
            var players = new List<Player>();

            var rows = doc.DocumentNode.SelectNodes("(//table)[1]/tbody/tr");

            foreach (var tr in rows)
            {
                var player = new Player();

                var cells = tr.SelectNodes("./td");

                var linkPlayer = cells[1].SelectSingleNode(".//a");
                var imgCountry = cells[1].SelectSingleNode(".//img");

                player.ExternalId = int.Parse(linkPlayer.GetAttributeValue("href", default(string)).Split("/")[2]);
                player.Name = linkPlayer.InnerText;
                player.FullName = linkPlayer.GetAttributeValue("data-tippy-content", default(string));
                player.Country = imgCountry.GetAttributeValue("title", default(string));

                if (!countries.Any(c => c.Name == player.Country))
                {
                    var flag = imgCountry.GetAttributeValue("data-srcset", default(string));
                    var continent = leagues.FirstOrDefault(l => l.Country == player.Country)?.Continent;
                    countries.Add(new Country(player.Country, flag, continent.ToString()));
                }

                foreach (var linkPosition in cells[1].SelectNodes(".//a[@rel='nofollow']"))
                    player.Positions.Add(GetStandardizedPositionAbbreviation(linkPosition.InnerText));

                player.Age = int.Parse(cells[2].InnerText);
                player.Overall = int.Parse(cells[3].SelectSingleNode(".//em").InnerText);
                player.Potential = int.Parse(cells[4].SelectSingleNode(".//em").InnerText);

                var start = cells[5].InnerText.IndexOf('(') + 1;
                var length = cells[5].InnerText.IndexOf(')') - start;
                player.JerseyNumber = int.Parse(cells[5].InnerText.Substring(start, length));

                player.Photo = cells[0].SelectSingleNode(".//img").GetAttributeValue("data-srcset", default(string));

                players.Add(player);
            }

            return players;
        }
    }
}
