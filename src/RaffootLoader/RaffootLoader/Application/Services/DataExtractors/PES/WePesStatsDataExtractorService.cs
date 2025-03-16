using HtmlAgilityPack;
using RaffootLoader.Application.DTO;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.PES;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Application.Services.Abstract;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Infrastructure.CrossCutting.Utils;

namespace RaffootLoader.Application.Services.DataExtractors.PES
{
    public class WePesStatsDataExtractorService(IHttpClientWebScraper webScraper, ISettings settings) : PesService, IWePesStatsDataExtractorService
    {
        private const string BaseUrl = "https://wepesstats.rf.gd/";
        private const string Cookies = "__cf_bm=CtwvzsNeT7HZfb.cOQEGynM3XJXxpbOWAmFuq8dOViI-1728050460-1.0.1.1-pnnN9.tI5EgPU.pic_N0yH1D9Uj.FEhhc36dXoF9xfmQfeY58Ilhiemna5svmZ.bAdRjjsrz.14KuTsoT0iOkA";

        private readonly List<League> leagues = [];
        private readonly List<Club> clubs = [];
        private readonly List<Player> players = [];
        private readonly List<Country> countries = [];

        public async Task<DatabaseDto> GetDatabaseDto()
        {
            var database = new DatabaseDto();

            webScraper.SetCookies(BaseUrl, Cookies);

            await GetData().ConfigureAwait(false);

            database.Year = settings.Year;
            database.Clubs = clubs;
            database.Players = players;
            database.Countries = countries;

            return database;
        }

        private async Task<List<Player>> GetData()
        {
            var baseUrl = $"{BaseUrl}pes{settings.Year.ToString().Last()}.php";
            var html = await webScraper.GetHtmlDocument(baseUrl).ConfigureAwait(false);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            var lastLink = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'pagination')]/a[last()]");
            var maxPage = int.Parse(lastLink.InnerText);

            Console.WriteLine();

            for (var page = 1; page <= maxPage; page++)
            {
                var url = $"{baseUrl}?page={page}";
                html = await webScraper.GetHtmlDocument(url).ConfigureAwait(false);
                doc.LoadHtml(html);
                GetData(doc);

                ConsoleUtils.ShowProgress(page, maxPage, $"Players: ");
            }

            foreach (var player in players)
                if (!countries.Any(c => c.Name == player.Country))
                    countries.Add(new Country(player.Country, null, leagues.FirstOrDefault(l => l.Country == player.Country)?.Continent.ToString()));

            Console.WriteLine();

            return players;
        }

        private void GetData(HtmlDocument doc)
        {
            var table = doc.DocumentNode.SelectSingleNode("(//table)[3]");

            var header = table.SelectNodes("./thead/tr/th");
            var rows = table.SelectNodes("./tbody/tr");

            foreach (var tr in rows)
            {
                var cells = tr.SelectNodes("./td");

                var clubName = GetStandardizedClubName(cells[GetIndex("Team")].InnerText.Trim());
                var league = GetLeagueByClubName(clubName);

                if (league == null)
                    continue;

                if (!leagues.Any(l => l.ExternalId == league.ExternalId))
                    leagues.Add(league);

                if (!clubs.Any(c => c.Name == clubName))
                    clubs.Add(new Club { ExternalId = clubs.Count + 1, Name = clubName, Country = league.Country });

                var countryName = GetStandardizedCountryName(cells[GetIndex("Nationality")].InnerText);

                var position = GetStandardizedPositionAbbreviation(cells[GetIndex("Position")].InnerText, cells[GetIndex("Foot")].InnerText);
                var overall = int.Parse(cells[GetIndex("Overall Rating")].InnerText);

                var player = new Player
                {
                    ExternalId = int.Parse(cells[GetIndex("ID")].InnerText),
                    Name = cells[GetIndex("Name")].InnerText,
                    Age = int.Parse(cells[GetIndex("Age")].InnerText),
                    Country = countryName,
                    Positions = [position],
                    Overall = overall,
                    Potential = overall,
                    ClubId = clubs.Single(c => c.Name == clubName).ExternalId
                };

                players.Add(player);
            }

            int GetIndex(string columnName) => header.IndexOf(header.First(n => n.InnerText.StartsWith(columnName)));
        }

        private League GetLeagueByClubName(string clubName)
        {
            var leaguesClubs = new List<Tuple<League, List<string>, List<int>>>
            {
                new(new(1, "Argentina", 1, Continent.America), ["Boca Juniors", "River Plate"], [2003]),
                new(new(2, "Brazil", 1, Continent.America), [], []),

                new(new(3, "Belgium", 1, Continent.Europe), ["Anderlecht", "Club Brugge"], [2003]),
                new(new(4, "Czechia", 1, Continent.Europe), ["Sparta Praha"], [2003]),
                new(new(5, "England", 1, Continent.Europe), ["Arsenal", "Aston Villa", "Birmingham City", "Blackburn Rovers", "Bolton Wanderers", "Charlton Athletic", "Chelsea", "Crystal Palace", "Everton", "Fulham", "Liverpool", "Manchester City", "Manchester United", "Middlesbrough", "Newcastle United", "Norwich City", "Portsmouth", "Southampton", "Tottenham Hotspur", "West Bromich Albion", "Leeds United", "West Ham United"], [2003, 2004]),
                new(new(6, "France", 1, Continent.Europe), ["Ajaccio", "Monaco", "Auxerre", "Bastia", "Bordeaux", "Caen", "Istres", "LOSC Lille", "Olympique Lyonnais", "Metz", "Nantes", "Nice", "Olympique de Marseille", "Paris Saint Germain", "Lens", "Rennes", "Saint-Étienne", "Sochaux", "Strasbourg", "Toulouse"], [2003, 2004]),
                new(new(7, "Germany", 1, Continent.Europe), ["Arminia Bielefeld", "Bayer 04 Leverkusen", "FC Bayern München", "VfL Bochum 1848", "Borussia Dortmund", "Borussia Mönchengladbach", "SC Freiburg", "Hamburger SV", "Hannover 96", "Hansa Rostock", "Hertha Berlin", "Kaiserslautern", "Mainz", "Nürnberg", "Schalke 04", "VfB Stuttgart", "VfL Wolfsburg", "Werder Bremen"], [2003, 2004]),
                new(new(8, "Greece", 1, Continent.Europe), ["AEK Athens", "Olympiakos Piraeus", "Panathinaikos"], [2003]),
                new(new(9, "Italy", 1, Continent.Europe), ["Atalanta", "Bologna", "Brescia", "Cagliari", "Chievo", "Fiorentina", "Inter", "Juventus", "Lazio", "Lecce", "Livorno", "ACR Messina", "Milan", "Palermo", "Parma", "Perugia", "Reggina", "Roma", "Sampdoria", "Siena", "Udinese"], [2003, 2004]),
                new(new(10, "Netherlands", 1, Continent.Europe), ["ADO Den Haag", "Ajax", "AZ Alkmaar", "De Graafschap", "FC Den Bosch", "Feyenoord", "FC Groningen", "SC Heerenveen", "NAC Breda", "NEC", "PSV", "RKC Waalwijk", "Roda JC Kerkrade", "RBC Roosendaal", "FC Twente", "FC Utrecht", "Willem II", "Vitesse"], [2003, 2004]),
                new(new(11, "Portugal", 1, Continent.Europe), ["Benfica", "Porto", "Sporting CP"], [2003]),
                new(new(12, "Russia", 1, Continent.Europe), ["Lokomotiv Moskva", "Spartak Moskva"], [2003]),
                new(new(13, "Scotland", 1, Continent.Europe), ["Celtic", "Rangers"], [2003]),
                new(new(14, "Spain", 1, Continent.Europe), ["Albacete", "Athletic Club", "Atlético Madrid", "FC Barcelona", "Celta de Vigo", "Deportivo La Coruña", "Espanyol", "Getafe", "Levante", "Málaga", "Mallorca", "Numancia", "Osasuna", "Racing Santander", "Real Betis", "Real Madrid", "Real Sociedad", "Real Zaragoza", "Sevilla", "Valencia", "Villarreal"], [2003, 2004]),
                new(new(15, "Türkiye", 1, Continent.Europe), ["Beşiktaş", "Galatasaray", "Fenerbahçe"], [2003]),
            };

            var tuple = leaguesClubs.SingleOrDefault(lc => lc.Item2.Contains(clubName) && lc.Item3.Contains(settings.Year));
            return tuple?.Item1;
        }

        private static string GetStandardizedPositionAbbreviation(string position, string foot)
        {
            return (position, foot) switch
            {
                ("SW", "Left") or ("SW", "Right") => "CB",
                ("CBT", "Left") or ("CBT", "Right") => "CB",
                ("CBW", "Left") or ("CBW", "Right") => "CB",
                ("SB", "Left") => "LB",
                ("SB", "Right") => "RB",
                ("DMF", "Left") or ("DMF", "Right") => "CDM",
                ("CMF", "Left") or ("CMF", "Right") => "CM",
                ("SMF", "Left") => "LM",
                ("SMF", "Right") => "RM",
                ("OMF", "Left") or ("OMF", "Right") => "CAM",
                ("WG", "Left") or ("WF", "Left") => "LW",
                ("WG", "Right") or ("WF", "Right") => "RW",
                ("CF", "Left") or ("CF", "Right") => "ST",
                _ => position,
            };
        }
    }
}
