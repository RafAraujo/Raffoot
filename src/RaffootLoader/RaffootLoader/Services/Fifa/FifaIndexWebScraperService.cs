using HtmlAgilityPack;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.DTO;
using RaffootLoader.Services.Fifa.Abstract;
using RaffootLoader.Utils;
using System.Net;

namespace RaffootLoader.Services.Fifa
{
	public class FifaIndexWebScraperService(ISettings settings) : FifaService, IDataExtractorService
	{
		private const string BaseUrl = "https://fifaindex.com/";
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

				var url = $"{BaseUrl}teams/fifa{settings.Year.ToString()[2..]}/?league={league.ExternalId}";
				var doc = await GetHtmlDocument(url).ConfigureAwait(false);

				var table = doc.DocumentNode.Descendants().FirstOrDefault(n => n.Name == "table");
				if (table == null || doc.DocumentNode.OuterHtml.Contains("Select a valid choice"))
					continue;

				var tbody = table.Descendants().First(n => n.Name == "tbody");
				var rows = tbody.Descendants().Where(n => n.Name == "tr");

				foreach (var tr in rows)
				{
					var cells = tr.Descendants().Where(n => n.Name == "td").ToList();
					if (tr.HasClass("d-lg-none") || cells.Count == 0)
						continue;

					var link = cells[1].Descendants().First(n => n.Name == "a");

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
			var doc = await GetHtmlDocument(url).ConfigureAwait(false);
			return doc;
		}

		private static IEnumerable<HtmlNode> GetPlayersHtmlNodes(HtmlDocument doc)
		{
			var table = doc.DocumentNode.Descendants().First(n => n.Name == "table");
			var tbody = table.Descendants().First(n => n.Name == "tbody");
			var rows = tbody.Descendants().Where(n => n.Name == "tr");
			return rows;
		}

		private List<Player> GetPlayers(HtmlDocument doc, List<League> leagues)
		{
			var players = new List<Player>();
			var rows = GetPlayersHtmlNodes(doc);

			foreach (var tr in rows)
			{
				var player = new Player();

				var cells = tr.Descendants().Where(n => n.Name == "td").ToList();

				var linkPlayer = cells[5].Descendants().First(n => n.Name == "a");
				var imgCountry = cells[3].Descendants().First(n => n.Name == "img");

				player.ExternalId = int.Parse(linkPlayer.GetAttributeValue("href", default(string)).Split("/")[2]);
				player.Name = linkPlayer.InnerText;
				player.Country = GetStandardizedCountryName(imgCountry.GetAttributeValue("alt", default(string)));

				if (!countries.Any(c => c.Name == player.Country))
				{
					var continent = leagues.FirstOrDefault(l => l.Country == player.Country)?.Continent;
					var country = new Country(GetStandardizedCountryName(player.Country), null, continent.ToString());
					countries.Add(country);
				}

				foreach (var span in cells[6].Descendants().Where(n => n.Name == "span"))
					player.Positions.Add(GetStandardizedPositionAbbreviation(span.InnerText));

				player.Age = int.Parse(cells[7].InnerText);

				var overallList = cells[4].Descendants().Where(n => n.Name == "span").ToList();
				player.Overall = int.Parse(overallList[0].InnerText);
				player.Potential = int.Parse(overallList[1].InnerText);
				player.JerseyNumber = int.Parse(cells[0].InnerText);
				player.Photo = cells[2].Descendants().First(n => n.Name == "img").GetAttributeValue("srcset", default(string));

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
			var cookieContainer = new CookieContainer();
			var handler = new HttpClientHandler
			{
				UseCookies = true,
				CookieContainer = cookieContainer,
			};

			var client = new HttpClient(handler);
			client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36");

			var cookie = new Cookie("__cf_bm", "CtwvzsNeT7HZfb.cOQEGynM3XJXxpbOWAmFuq8dOViI-1728050460-1.0.1.1-pnnN9.tI5EgPU.pic_N0yH1D9Uj.FEhhc36dXoF9xfmQfeY58Ilhiemna5svmZ.bAdRjjsrz.14KuTsoT0iOkA");
			cookieContainer.Add(new Uri(BaseUrl), cookie);

			return client;
		}
	}
}
