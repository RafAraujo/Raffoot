using HtmlAgilityPack;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Interfaces;
using RaffootLoader.Utils;
using System.Net;

namespace RaffootLoader.Services
{
    public class SoFifaDataExtractorService : IDataExtractorService
    {
        private const string BaseUrl = "https://sofifa.com/";

        private readonly IContext _context;
        private readonly HttpClient _client;
        private readonly IList<Country> _countries;

        public SoFifaDataExtractorService(IContext context)
        {
            _context = context;

            _client = new();
            _client.DefaultRequestHeaders.Add("User-Agent", "C# App");

            _countries = new List<Country>();
        }

        public async Task CreateDatabase()
        {
            if (_context.DatabaseExists())
            {
                Console.WriteLine("Database already exists");
                return;
            }
            else
            {
                Console.WriteLine("Creating database...");
            }

            var leagues = GetLeagues();
            var clubs = await GetClubs(leagues).ConfigureAwait(false);
            var players = await GetPlayers(clubs).ConfigureAwait(false);

            _context.InsertMany(leagues);
            _context.InsertMany(clubs);
            _context.InsertMany(players);
            _context.InsertMany(_countries.OrderBy(c => c.Name));
        }

        public static IEnumerable<League> GetLeagues()
        {
            var leagues = new[]
            {
                new League(353, "Argentina", 1),
                new League(80, "Austria", 1),
                new League(351, "Australia", 1),
                new League(4, "Belgium", 1),
                new League(2017, "Bolivia", 1),
                new League(7, "Brazil", 1),
                new League(335, "Chile", 1),
                new League(2012, "China PR", 1),
                new League(336, "Colombia", 1),
                new League(317, "Croatia", 1),
                new League(318, "Cyprus", 1),
                new League(319, "Czech Republic", 1),
                new League(1, "Denmark", 1),
                new League(2018, "Ecuador", 1),
                new League(13, "England", 1),
                new League(14, "England", 2),
                new League(60, "England", 3),
                new League(61, "England", 4),
                new League(62, "England", 5),
                new League(322, "Finland", 1),
                new League(16, "France", 1),
                new League(17, "France", 2),
                new League(19, "Germany", 1),
                new League(20, "Germany", 2),
                new League(2076, "Germany", 3),
                new League(63, "Greece", 1),
                new League(64, "Hungary", 1),
                new League(2149, "India", 1),
                new League(31, "Italy", 1),
                new League(32, "Italy", 2),
                new League(349, "Japan", 1),
                new League(83, "Korea Republic", 1),
                new League(341, "Mexico", 1),
                new League(10, "Netherlands", 1),
                new League(41, "Norway", 1),
                new League(337, "Paraguay", 1),
                new League(2020, "Peru", 1),
                new League(66, "Poland", 1),
                new League(308, "Portugal", 1),
                new League(65, "Republic of Ireland", 1),
                new League(330, "Romania", 1),
                new League(67, "Russia", 1),
                new League(350, "Saudi Arabia", 1),
                new League(50, "Scotland", 1),
                new League(347, "South Africa", 1),
                new League(53, "Spain", 1),
                new League(54, "Spain", 2),
                new League(56, "Sweden", 1),
                new League(189, "Switzerland", 1),
                new League(68, "Turkey", 1),
                new League(332, "Ukraine", 1),
                new League(2013, "United Arab Emirates", 1),
                new League(39, "United States", 1),
                new League(338, "Uruguay", 1),
                new League(2019, "Venezuela", 1),
            };

            foreach (var group in leagues.GroupBy(l => l.ExternalId))
            {
                if (group.Count() > 1)
                    throw new Exception();
            }

            return leagues;
        }

        public async Task<IEnumerable<Club>> GetClubs(IEnumerable<League> leagues)
        {
            var clubs = new List<Club>();

            foreach (var league in leagues)
            {
                Console.WriteLine("{0}{1} {2}", Environment.NewLine, league.Country, league.Division);
                Console.WriteLine();

                var url = string.Format("{0}{1}{2}", BaseUrl, "teams/?lg=", league.ExternalId);
                var doc = await GetHtmlDocument(url);

                var table = doc.DocumentNode.Descendants().FirstOrDefault(n => n.Name == "table" && n.HasClass("persist-area"));
                if (table == null)
                {
                    continue;
                }
                var tbody = table.Descendants().First(n => n.Name == "tbody");
                var rows = tbody.Descendants().Where(n => n.Name == "tr" && n.Descendants().Count(n => n.Name == "td") == 8);

                foreach (var tr in rows)
                {
                    var club = new Club { LeagueId = league.ExternalId };

                    var cells = tr.Descendants().Where(n => n.Name == "td").ToList();

                    var link = cells[1].Descendants().First(n => n.Name == "a");
                    var div = link.Descendants().First(n => n.Name == "div");

                    club.ExternalId = int.Parse(link.GetAttributeValue("href", default(string)).Split("/")[2]);
                    club.Name = div.InnerText;

                    clubs.Add(club);
                    Console.Write("{0}, ", club.Name);
                }
            }

            return clubs;
        }

        public async Task<IEnumerable<Player>> GetPlayers(IEnumerable<Club> clubs)
        {
            var players = new List<Player>();

            foreach (var club in clubs)
            {
                var url = string.Format("{0}{1}{2}", BaseUrl, "team/", club.ExternalId);
                var doc = await GetHtmlDocument(url).ConfigureAwait(false);

                club.Logo = doc.DocumentNode.Descendants().First(n => n.Name == "div" && n.HasClass("bp3-card")).Descendants().First(n => n.Name == "img").GetAttributeValue("data-srcset", default(string));
                foreach (var div in doc.DocumentNode.Descendants().Where(n => n.Name == "div" && n.HasClass("block-half")))
                {
                    var img = div.Descendants().First(n => n.Name == "img");
                    club.Kits.Add(img.GetAttributeValue("data-srcset", default(string)));
                }

                var table = doc.DocumentNode.Descendants().First(n => n.Name == "table" && n.HasClass("persist-area"));
                var tbody = table.Descendants().First(n => n.Name == "tbody");
                var rows = tbody.Descendants().Where(n => n.Name == "tr");

                foreach (var tr in rows)
                {
                    var player = new Player { ClubId = club.ExternalId };

                    var cells = tr.Descendants().Where(n => n.Name == "td").ToList();

                    var linkPlayer = cells[1].Descendants().First(n => n.Name == "a");

                    player.ExternalId = int.Parse(linkPlayer.GetAttributeValue("href", default(string)).Split("/")[2]);
                    player.Name = linkPlayer.Descendants().First(n => n.Name == "div").InnerText;
                    player.FullName = linkPlayer.GetAttributeValue("aria-label", default(string));
                    player.Country = cells[1].Descendants().First(n => n.Name == "img").GetAttributeValue("title", default(string));

                    if (!_countries.Any(c => c.Name == player.Country))
                    {
                        var flag = cells[1].Descendants().First(n => n.Name == "img").GetAttributeValue("data-srcset", default(string));
                        _countries.Add(new Country(player.Country, flag));
                    }

                    foreach (var linkPosition in cells[1].Descendants().Where(n => n.Name == "a" && n.Attributes.Any(a => a.Name == "rel" && a.Value == "nofollow")))
                        player.Positions.Add(linkPosition.InnerText);

                    player.Age = int.Parse(cells[2].InnerText);
                    player.Overall = int.Parse(cells[3].InnerText);
                    player.Potential = int.Parse(cells[4].InnerText);

                    var start = cells[5].InnerText.IndexOf("(") + 1;
                    var length = cells[5].InnerText.IndexOf(")") - start;
                    player.JerseyNumber = int.Parse(cells[5].InnerText.Substring(start, length));

                    player.EndOfContract = int.Parse(cells[5].Descendants().First(n => n.Name == "div").InnerText.Split(' ')[3]);

                    player.Photo = cells[0].Descendants().First(n => n.Name == "img").GetAttributeValue("data-srcset", default(string));

                    players.Add(player);
                }
            }

            return players;
        }

        private async Task<HtmlDocument> GetHtmlDocument(string url)
        {
            HttpResponseMessage message = null;
            HtmlDocument doc = null;

            try
            {
                message = await _client.GetAsync(url).ConfigureAwait(false);
                message.EnsureSuccessStatusCode();
                var html = await message.Content.ReadAsStringAsync().ConfigureAwait(false);
                doc = new HtmlDocument();
                doc.LoadHtml(html);
            }
            catch (HttpRequestException ex)
            {
                ConsoleUtils.ShowException(ex);

                if (message.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("Waiting...");
                    Console.ResetColor();

                    await Task.Delay(TimeSpan.FromSeconds(5)).ConfigureAwait(false);
                    return await GetHtmlDocument(url).ConfigureAwait(false);
                }
            }

            return doc;
        }
    }
}
