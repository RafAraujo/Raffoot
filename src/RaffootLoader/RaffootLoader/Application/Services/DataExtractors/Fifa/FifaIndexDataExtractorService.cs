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
    public class FifaIndexDataExtractorService(
        IHtmlDocumentService htmlDocumentService,
        IHttpClientWebScraper webScraper,
        ISettings settings) : FifaService, IFifaIndexDataExtractorService
    {
        private const string BaseUrl = "https://fifaindex.com/";
        private const string Cookies = "usprivacy=1YNY; _li_dcdm_c=.fifaindex.com; _lc2_fpi=ccdfaad9d699--01jntr0ccm3dw4d5h49h487z29; _lc2_fpi_meta=%7B%22w%22%3A1741433090452%7D; _lr_retry_request=true; _lr_env_src_ats=false; panoramaId_expiry=1741519491384; _cc_id=fa8dfb44e319958a7e290583877643d9; panoramaId=828f1f95d980b1e969c9cf494c47a9fb927af8d488855408f7903172379b19ca; _scor_uid=a98cb2d8b781439b8ff7adea00ef24d7; _gid=GA1.2.312387751.1741433091; TAPAD=%7B%22id%22%3A%225a219ba2-03c6-411a-a236-6bbaa97b51a6%22%7D; _ga_JNP72VLH86=GS1.1.1741433090.1.1.1741433609.0.0.0; _ga=GA1.1.337758245.1741433091; __gads=ID=945e0bac4c48301a:T=1741433093:RT=1741434092:S=ALNI_MaqCveVmM-pVjFXYMA2jGOe6GWz8g; __gpi=UID=0000106298b27ccf:T=1741433093:RT=1741434092:S=ALNI_MbXag2cWFL2CcUSrm70kj3wbQhikQ; __eoi=ID=c36ae93a11f602ea:T=1741433093:RT=1741434092:S=AA-AfjayvENhimwhhdH5Jr53-F6v";

        private List<Country> countries = [];

        public async Task<DatabaseDto> GetDatabaseDto()
        {
            var database = new DatabaseDto();

            webScraper.SetCookies(BaseUrl, Cookies);

            var leagues = GetLeagues();
            var clubs = await GetClubs(leagues).ConfigureAwait(false);
            var players = await GetPlayers(leagues, clubs).ConfigureAwait(false);
            countries = [.. countries.OrderBy(c => c.Name)];

            database.Year = settings.Year;
            database.Clubs = clubs;
            database.Players = players;
            database.Countries = countries;

            return database;
        }

        private async Task<List<Club>> GetClubs(List<League> leagues)
        {
            var clubs = new List<Club>();

            var current = 0;

            foreach (var league in leagues)
            {
                ConsoleUtils.ShowProgress(++current, leagues.Count, $"Getting {league.Country} clubs: ");

                var url = $"{BaseUrl}teams/fifa{settings.Year.ToString()[2..]}/?league={league.ExternalId}";
                var doc = await htmlDocumentService.GetHtmlDocument(league, url, webScraper).ConfigureAwait(false);

                var table = doc.DocumentNode.SelectSingleNode("//table");
                if (table == null || doc.DocumentNode.OuterHtml.Contains("Select a valid choice"))
                    continue;

                var rows = table.SelectNodes(".//tbody/tr");

                foreach (var tr in rows)
                {
                    var cells = tr.SelectNodes("./td");
                    if (tr.HasClass("d-lg-none") || cells == null)
                        continue;

                    var link = cells[1].SelectSingleNode(".//a[1]");

                    var clubName = GetStandardizedClubName(link.InnerText);
                    var country = league.Country == "Rest of World" ? GetCountryForRestOfWorldClub(clubName) : league.Country;

                    var club = new Club
                    {
                        ExternalId = int.Parse(link.GetAttributeValue("href", default(string)).Split("/")[2]),
                        Name = clubName,
                        Country = country,
                    };

                    clubs.Add(club);
                }
            }

            ConsoleUtils.ShowProgress(current, leagues.Count, $"Clubs: ");

            return clubs;
        }

        private async Task<HtmlDocument> GetHtmlDocument(Club club)
        {
            var clubName = club.Name
                .Replace(" ", string.Empty)
                .Replace("'", string.Empty)
                .Replace("&", string.Empty)
                .Replace("+", string.Empty)
                .Replace("/", "-")
                .Replace(".", "-");

            var url = $"{BaseUrl}{"team/"}{club.ExternalId}/{clubName}/fifa{settings.Year.ToString()[2..]}/";
            var doc = await htmlDocumentService.GetHtmlDocument(club, url, webScraper);
            return doc;
        }

        private async Task<List<Player>> GetPlayers(List<League> leagues, List<Club> clubs)
        {
            var players = new List<Player>();

            var current = 0;
            Console.WriteLine();

            foreach (var club in clubs)
            {
                ConsoleUtils.ShowProgress(++current, clubs.Count, $"Getting {club.Name} players: ");

                var doc = await GetHtmlDocument(club).ConfigureAwait(false);
                var clubPlayers = GetPlayers(doc, leagues);

                foreach (var player in clubPlayers)
                    player.ClubId = club.ExternalId;

                players.AddRange(clubPlayers);
            }

            ConsoleUtils.ShowProgress(current, clubs.Count, $"Players: ");
            Console.WriteLine();

            return players;
        }

        private List<Player> GetPlayers(HtmlDocument doc, List<League> leagues)
        {
            var players = new List<Player>();
            var rows = doc.DocumentNode.SelectNodes("(//table[1])/tbody/tr");

            foreach (var tr in rows)
            {
                var player = new Player();

                var cells = tr.SelectNodes("./td");

                var linkPlayer = cells[5].SelectSingleNode(".//a");
                var imgCountry = cells[3].SelectSingleNode(".//img");

                player.ExternalId = int.Parse(linkPlayer.GetAttributeValue("href", default(string)).Split("/")[2]);
                player.Name = linkPlayer.InnerText;
                player.Country = GetStandardizedCountryName(imgCountry.GetAttributeValue("alt", default(string)));

                if (!countries.Any(c => c.Name == player.Country))
                {
                    var continent = leagues.FirstOrDefault(l => l.Country == player.Country)?.Continent;
                    var country = new Country(GetStandardizedCountryName(player.Country), null, continent.ToString());
                    countries.Add(country);
                }

                foreach (var span in cells[6].SelectNodes(".//span"))
                    player.Positions.Add(GetStandardizedPositionAbbreviation(span.InnerText));

                player.Age = int.Parse(cells[7].InnerText);

                var overallList = cells[4].SelectNodes(".//span");
                player.Overall = int.Parse(overallList[0].InnerText);
                player.Potential = int.Parse(overallList[1].InnerText);
                player.JerseyNumber = int.Parse(cells[0].InnerText);
                player.Photo = cells[2].SelectSingleNode(".//img").GetAttributeValue("srcset", default(string));

                players.Add(player);
            }

            return players;
        }
    }
}
