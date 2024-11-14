using HtmlAgilityPack;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Abstract;
using RaffootLoader.Services.DTO;
using RaffootLoader.Utils;

namespace RaffootLoader.Services.Fifa
{
    public class FifaIndexWebScraperService(ISettings settings) : FifaService, IDataExtractorService
	{
		private const string BaseUrl = "https://fifaindex.com/";
		private const string cookies = "_gid=GA1.2.1176454803.1730869752; usprivacy=1YNY; _lr_env_src_ats=false; panoramaId_expiry=1730956152343; _cc_id=c103089bb27918931e2b1f78c1bb95cd; _scor_uid=18e75ebe943d45b09b6deacee55ea2a5; _li_dcdm_c=.fifaindex.com; _lc2_fpi=ccdfaad9d699--01j8crs8n8cae8b8r12t5aqfnn; _lc2_fpi_meta=%7B%22w%22%3A1727005500072%7D; _lr_retry_request=true; _gat_UA-67914106-1=1; _ga_JNP72VLH86=GS1.1.1730909958.4.0.1730909958.0.0.0; _ga=GA1.1.1470241376.1730869752";
		private readonly HttpClient client = GetHttpClient(BaseUrl, cookies);

		private List<Country> countries = [];

		public async Task<DatabaseDto> GetDatabase()
		{
			var database = new DatabaseDto();

			var leagues = GetLeagues();
			var clubs = await GetClubs(leagues).ConfigureAwait(false);
			var players = await GetPlayers(leagues, clubs).ConfigureAwait(false);
			countries = [.. countries.OrderBy(c => c.Name)];

			database.Year = settings.Year;
			database.Leagues = leagues;
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
				var doc = await GetHtmlDocument(client, url).ConfigureAwait(false);

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

					var leagueExternalId = league.ExternalId;
					var clubName = GetStandardizedClubName(link.InnerText);

					if (league.Country == "Rest of World")
					{
						var country = GetCountryForRestOfWorldClub(clubName);
						leagueExternalId = leagues.Single(l => l.Country == country).ExternalId;
					}

					var club = new Club
					{
						LeagueId = leagueExternalId,
						ExternalId = int.Parse(link.GetAttributeValue("href", default(string)).Split("/")[2]),
						Name = clubName,
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
			var doc = await GetHtmlDocument(client, url).ConfigureAwait(false);
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
