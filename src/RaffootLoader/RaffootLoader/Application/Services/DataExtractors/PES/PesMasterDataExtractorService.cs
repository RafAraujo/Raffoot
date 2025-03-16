using HtmlAgilityPack;
using RaffootLoader.Application.DTO;
using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.PES;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Application.Services.Abstract;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Infrastructure.CrossCutting.Utils;

namespace RaffootLoader.Application.Services.DataExtractors.PES
{
    public class PesMasterDataExtractorService(
        IHtmlDocumentService htmlDocumentService,
        IHttpClientWebScraper webScraper,
        ISettings settings) : PesService, IPesMasterDataExtractorService
    {
        private const string BaseUrl = "https://www.pesmaster.com/";

        private List<Country> countries = [];

        public async Task<DatabaseDto> GetDatabaseDto()
        {
            var database = new DatabaseDto();

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

                var url = GetLeagueUrl(league);
                var doc = await htmlDocumentService.GetHtmlDocument(league, url, webScraper).ConfigureAwait(false);

                return GetClubs(doc, league);
            }

            ConsoleUtils.ShowProgress(current, leagues.Count, $"Clubs: ");

            return clubs;
        }

        private List<Club> GetClubs(HtmlDocument doc, League league)
        {
            var clubs = new List<Club>();

            var xpath = settings.Year < 2020 ? "(//table)[1]/tbody/tr" : "(//div[contains(@class, 'team-block-container')])[1]/div[contains(@class, 'team-block')]";
            var nodes = doc.DocumentNode.SelectNodes(xpath);
            if (nodes == null)
                return clubs;

            foreach (var node in nodes)
            {
                xpath = settings.Year < 2020 ? "./td//a" : ".//a";
                var link = node.SelectSingleNode(xpath);

                var clubName = settings.Year < 2020 ? link.InnerText : node.GetAttributeValue("data-name", default(string));

                var club = new Club
                {
                    ExternalId = int.Parse(link.GetAttributeValue("href", default(string)).Split("/")[4]),
                    Name = GetStandardizedClubName(clubName),
                    Country = league.Country,
                };

                clubs.Add(club);
            }

            return clubs;
        }

        private string GetLeagueUrl(League league)
        {
            return league.Country switch
            {
                "Brazil" => $"{BaseUrl}brazilian-league/pes-{settings.Year}/league/{league.ExternalId}/",
                _ => string.Empty,
            };
        }

        private async Task<List<Player>> GetPlayers(List<League> leagues, List<Club> clubs)
        {
            var players = new List<Player>();

            var current = 0;
            Console.WriteLine();

            foreach (var club in clubs)
            {
                ConsoleUtils.ShowProgress(++current, clubs.Count, $"Getting {club.Name} players: ");

                var url = $"{BaseUrl}{club.Name.ToLower().Replace(' ', '-').RemoveDiacritics()}/pes-{settings.Year}/{"team/"}{club.ExternalId}/";
                var doc = await htmlDocumentService.GetHtmlDocument(club, url, webScraper).ConfigureAwait(false);

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

            var rows = doc.DocumentNode.SelectNodes("(//table[@id='search-result-table'])[1]/tbody/tr");

            foreach (var tr in rows)
            {
                var player = new Player();

                var cells = tr.SelectNodes("./td");

                var linkPlayer = cells[0].SelectSingleNode(".//a");
                var imgCountry = cells[2].SelectSingleNode(".//img");

                player.ExternalId = int.Parse(linkPlayer.GetAttributeValue("href", default(string)).Split("/")[4]);
                player.Name = linkPlayer.InnerText;
                player.FullName = player.Name;
                player.Country = GetStandardizedCountryName(imgCountry.GetAttributeValue("title", default(string)));

                if (!countries.Any(c => c.Name == player.Country))
                {
                    var flag = imgCountry.GetAttributeValue("data-srcset", default(string));
                    var continent = leagues.FirstOrDefault(l => l.Country == player.Country)?.Continent;
                    var country = new Country(player.Country, flag, continent.ToString());
                    countries.Add(country);
                }

                var position = cells[5].SelectSingleNode(".//span").InnerText;
                player.Positions.Add(GetStandardizedPositionAbbreviation(position));

                player.Age = int.Parse(cells[3].InnerText);
                player.Overall = int.Parse(cells[6].InnerText);
                player.Potential = player.Overall;
                player.JerseyNumber = int.Parse(cells[1].InnerText);

                var imgPlayer = cells[0].SelectSingleNode(".//img");
                player.Photo = imgPlayer?.GetAttributeValue("data-src", default(string));
                if (!string.IsNullOrEmpty(player.Photo))
                    player.Photo = new Uri(new Uri(BaseUrl), player.Photo).ToString();

                players.Add(player);
            }

            return players;
        }
    }
}
