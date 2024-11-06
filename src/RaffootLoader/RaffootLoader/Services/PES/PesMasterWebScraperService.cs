using HtmlAgilityPack;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.DTO;
using RaffootLoader.Services.Fifa.Abstract;
using RaffootLoader.Utils;

namespace RaffootLoader.Services.PES
{
	public class PesMasterWebScraperService(ISettings settings) : PesService, IDataExtractorService
	{
		private const string BaseUrl = "https://www.pesmaster.com/";
		private readonly HttpClient client = GetHttpClient();

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

				var url = GetLeagueUrl(league);
				var doc = await GetHtmlDocument(url).ConfigureAwait(false);

				if (settings.Year < 2020)
					return GetClubsFromTable(doc, league);
				else
					return GetClubsFromDiv(doc, league);
			}

			ConsoleUtils.ShowProgress(current, leagues.Count, $"Clubs: ");

			return clubs;
		}

		private static List<Club> GetClubsFromTable(HtmlDocument doc, League league)
		{
			var clubs = new List<Club>();

			var table = doc.DocumentNode.Descendants().FirstOrDefault(n => n.Name == "table");
			if (table == null)
				return clubs;

			var tbody = table.Descendants().First(n => n.Name == "tbody");
			var rows = tbody.Descendants().Where(n => n.Name == "tr");

			foreach (var tr in rows)
			{
				var cells = tr.Descendants().Where(n => n.Name == "td").ToList();
				var link = cells[0].Descendants().First(n => n.Name == "a");

				var club = new Club
				{
					LeagueId = league.ExternalId,
					ExternalId = int.Parse(link.GetAttributeValue("href", default(string)).Split("/")[4]),
					Name = GetStandardizedClubName(link.InnerText),
				};

				clubs.Add(club);
			}

			return clubs;
		}

		private static List<Club> GetClubsFromDiv(HtmlDocument doc, League league)
		{
			var clubs = new List<Club>();

			var divContainer = doc.DocumentNode.Descendants().FirstOrDefault(n => n.Name == "div" && n.HasClass("team-block-container"));
			if (divContainer == null)
				return clubs;

			var divs = divContainer.Descendants().Where(n => n.Name == "div" && n.HasClass("team-block"));

			foreach (var div in divs)
			{
				var link = div.Descendants().First(n => n.Name == "a");

				var club = new Club
				{
					LeagueId = league.ExternalId,
					ExternalId = int.Parse(link.GetAttributeValue("href", default(string)).Split("/")[4]),
					Name = GetStandardizedClubName(div.GetAttributeValue("data-name", default(string))),
				};

				clubs.Add(club);
			}

			return clubs;
		}

		private string GetClubUrl(Club club)
		{
			var clubNameWNormalized = club.Name.ToLower().Replace(' ', '-').RemoveDiacritics();
			var url = $"{BaseUrl}{clubNameWNormalized}/pes-{settings.Year}/{"team/"}{club.ExternalId}/";
			return url;
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

				var url = GetClubUrl(club);
				var doc = await GetHtmlDocument(url).ConfigureAwait(false);

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

			var table = doc.DocumentNode.Descendants().First(n => n.Name == "table" && n.Id == "search-result-table");
			var tbody = table.Descendants().First(n => n.Name == "tbody");
			var rows = tbody.Descendants().Where(n => n.Name == "tr");

			foreach (var tr in rows)
			{
				var player = new Player();

				var cells = tr.Descendants().Where(n => n.Name == "td").ToList();

				var linkPlayer = cells[0].Descendants().First(n => n.Name == "a");
				var imgCountry = cells[2].Descendants().First(n => n.Name == "img");

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

				var position = cells[5].Descendants().First(n => n.Name == "span").InnerText;
				player.Positions.Add(GetStandardizedPositionAbbreviation(position));

				player.Age = int.Parse(cells[3].InnerText);
				player.Overall = int.Parse(cells[6].InnerText);
				player.Potential = player.Overall;
				player.JerseyNumber = int.Parse(cells[1].InnerText);

				var imgPlayer = cells[0].Descendants().FirstOrDefault(n => n.Name == "img");
				player.Photo = imgPlayer?.GetAttributeValue("data-src", default(string));
				if (!string.IsNullOrEmpty(player.Photo))
					player.Photo = new Uri(new Uri(BaseUrl), player.Photo).ToString();

				players.Add(player);
			}

			return players;
		}

		private async Task<HtmlDocument> GetHtmlDocument(string url)
		{
			HttpResponseMessage message;
			HtmlDocument doc;
			try
			{
				message = await client.GetAsync(url).ConfigureAwait(false);
				message.EnsureSuccessStatusCode();
				var html = await message.Content.ReadAsStringAsync().ConfigureAwait(false);
				doc = new HtmlDocument();
				doc.LoadHtml(html);
			}
			catch (HttpRequestException ex)
			{
				ConsoleUtils.ShowException(ex);
				ConsoleUtils.WriteWarning("Waiting...");

				await Task.Delay(TimeSpan.FromSeconds(5)).ConfigureAwait(false);
				return await GetHtmlDocument(url).ConfigureAwait(false);
			}

			return doc;
		}

		private static HttpClient GetHttpClient()
		{
			var client = new HttpClient();
			client.DefaultRequestHeaders.Add("User-Agent", "C# App");
			return client;
		}
	}
}
