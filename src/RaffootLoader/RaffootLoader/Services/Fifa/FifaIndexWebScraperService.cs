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
		private const string cookies = "usprivacy=1YNY; _lr_env_src_ats=false; _cc_id=c103089bb27918931e2b1f78c1bb95cd; _scor_uid=18e75ebe943d45b09b6deacee55ea2a5; _li_dcdm_c=.fifaindex.com; _lc2_fpi=ccdfaad9d699--01j8crs8n8cae8b8r12t5aqfnn; _lc2_fpi_meta=%7B%22w%22%3A1727005500072%7D; _lr_retry_request=true; _gid=GA1.2.1365892259.1731625431; panoramaId_expiry=1731711831438; __gads=ID=fde8756baa827782:T=1730869754:RT=1731628219:S=ALNI_MYY_hBiDVdLte07gejakwcWWAEp2w; __gpi=UID=00000a67d069d280:T=1730869754:RT=1731628219:S=ALNI_MYdKJRFZrUPhVtEgeU_-qHH6M_LdQ; __eoi=ID=d564381f0d83c8f3:T=1730869754:RT=1731628219:S=AA-AfjZryjMEOiEbdBE5pfDwPKCJ; _gat_UA-67914106-1=1; _ga_JNP72VLH86=GS1.1.1731628241.7.1.1731628247.0.0.0; _ga=GA1.1.1470241376.1730869752; ccuid=5dfbcf3b-883a-427f-bb27-d65a16d42b7d";
		private readonly HttpClient client = GetHttpClient(BaseUrl, cookies);

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
