using HtmlAgilityPack;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.DTO;
using RaffootLoader.Services.Fifa.Abstract;
using RaffootLoader.Utils;

namespace RaffootLoader.Services.Fifa
{
	public class SoFifaDataExtractorService(ISettings settings) : FifaService, IFifaDataExtractorService
	{
		private const string BaseUrl = "https://sofifa.com/";
		private readonly HttpClient client = GetHttpClient();

		private int roster = 1;
		private List<League> leagues = [];
		private List<Country> countries = [];

		public async Task<FifaDatabaseDto> GetFifaDatabase()
		{
			var database = new FifaDatabaseDto();

			try
			{
				leagues = GetLeagues();
				roster = await GetRoster().ConfigureAwait(false);
				var clubs = await GetClubs().ConfigureAwait(false);
				var players = await GetPlayers(clubs).ConfigureAwait(false);
				countries = [.. countries.OrderBy(c => c.Name)];

				database.Year = settings.Year;
				database.Leagues = leagues;
				database.Clubs = clubs;
				database.Players = players;
				database.Countries = countries;
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}

			return database;
		}

		private async Task<int> GetRoster()
		{
			List<DateTime> dates = [];

			var league = leagues.Single(l => l.Country == "England" && l.Division == 1);
			var url = GetLeagueUrl(league, 1);
			var doc = await GetHtmlDocument(url).ConfigureAwait(false);

			var roster = doc.DocumentNode.Descendants().First(n => n.Name == "select" && n.GetAttributeValue("name", default(string)) == "roster");
			foreach (var option in roster.Descendants().Where(n => n.Name == "option"))
				if (DateTime.TryParse(option.InnerText, out DateTime value))
					dates.Add(value.Date);

			dates = [.. dates.OrderBy(d => d)];
			var date = dates.LastOrDefault(d => d.Year == settings.Year - 1);
			var index = dates.IndexOf(date);

			return index == -1 ? 1 : index + 1;
		}

		private async Task<IEnumerable<Club>> GetClubs()
		{
			var clubs = new List<Club>();

			var current = 0;

			foreach (var league in leagues)
			{
				ConsoleUtils.ShowProgress(++current, leagues.Count, $"Getting {league.Country} clubs: ");

				var url = GetLeagueUrl(league, roster);
				var doc = await GetHtmlDocument(url).ConfigureAwait(false);

				var table = doc.DocumentNode.Descendants().FirstOrDefault(n => n.Name == "table");
				if (table == null)
				{
					continue;
				}
				var tbody = table.Descendants().First(n => n.Name == "tbody");
				var rows = tbody.Descendants().Where(n => n.Name == "tr");

				foreach (var tr in rows)
				{
					var cells = tr.Descendants().Where(n => n.Name == "td").ToList();
					var link = cells[1].Descendants().First(n => n.Name == "a");

					var club = new Club
					{
						LeagueId = league.ExternalId,
						ExternalId = int.Parse(link.GetAttributeValue("href", default(string)).Split("/")[2]),
						Name = link.InnerText
					};

					clubs.Add(club);
				}
			}

			ConsoleUtils.ShowProgress(current, leagues.Count, $"Clubs: ");

			return clubs;
		}

		private string GetLeagueUrl(League league, int roster = 1)
		{
			var url = $"{BaseUrl}teams/?lg={league.ExternalId}&r={settings.Year.ToString()[2..]}{roster.ToString().PadLeft(4, '0')}&set=true";
			return url;
		}

		private async Task<IEnumerable<Player>> GetPlayers(IEnumerable<Club> clubs)
		{
			var players = new List<Player>();

			var current = 0;
			Console.WriteLine();

			foreach (var club in clubs)
			{
				ConsoleUtils.ShowProgress(++current, clubs.Count(), $"Getting {club.Name} players: ");

				var url = $"{BaseUrl}{"team/"}{club.ExternalId}&r={settings.Year.ToString()[2..]}{roster.ToString().PadLeft(4, '0')}&set=true";
				var doc = await GetHtmlDocument(url).ConfigureAwait(false);

				var clubPlayers = GetPlayers(doc);

				foreach (var player in clubPlayers)
				{
					player.ClubId = club.ExternalId;
				}

				players.AddRange(clubPlayers);

				club.Logo = GetLogo(doc);
				club.Kits = GetKits(doc);
			}

			ConsoleUtils.ShowProgress(current, clubs.Count(), $"Players: ");
			Console.WriteLine();

			return players;
		}

		private static string GetLogo(HtmlDocument doc)
		{
			var logo = doc.DocumentNode.Descendants()
				.First(n => n.Name == "div" && n.HasClass("profile")).Descendants()
				.First(n => n.Name == "img").GetAttributeValue("data-srcset", default(string));

			return logo;
		}

		private static List<string> GetKits(HtmlDocument doc)
		{
			var kits = new List<string>();

			var aside = doc.DocumentNode.Descendants().First(n => n.Name == "aside");
			foreach (var div in aside.Descendants().Where(n => n.Name == "div" && n.HasClass("grid")).TakeLast(2))
			{
				foreach (var innerDiv in div.Descendants().Where(n => n.Name == "div" && !string.IsNullOrEmpty(n.InnerHtml)))
				{
					var img = innerDiv.Descendants().First(n => n.Name == "img");
					kits.Add(img.GetAttributeValue("data-srcset", default(string)));
				}
			}

			return kits;
		}

		private List<Player> GetPlayers(HtmlDocument doc)
		{
			var players = new List<Player>();

			var table = doc.DocumentNode.Descendants().First(n => n.Name == "table");
			var tbody = table.Descendants().First(n => n.Name == "tbody");
			var rows = tbody.Descendants().Where(n => n.Name == "tr");

			foreach (var tr in rows)
			{
				var player = new Player();

				var cells = tr.Descendants().Where(n => n.Name == "td").ToList();

				var linkPlayer = cells[1].Descendants().First(n => n.Name == "a");
				var imgCountry = cells[1].Descendants().First(n => n.Name == "img");

				player.ExternalId = int.Parse(linkPlayer.GetAttributeValue("href", default(string)).Split("/")[2]);
				player.Name = linkPlayer.InnerText;
				player.FullName = linkPlayer.GetAttributeValue("data-tippy-content", default(string));
				player.Country = imgCountry.GetAttributeValue("title", default(string));

				if (!countries.Any(c => c.Name == player.Country))
				{
					var flag = imgCountry.GetAttributeValue("data-srcset", default(string));
					var continent = leagues.FirstOrDefault(l => l.Country == player.Country)?.Continent;
					var country = new Country(player.Country, flag, continent.ToString());
					countries.Add(country);
				}

				foreach (var linkPosition in cells[1].Descendants().Where(n => n.Name == "a" && n.Attributes.Any(a => a.Name == "rel" && a.Value == "nofollow")))
					player.Positions.Add(linkPosition.InnerText);

				player.Age = int.Parse(cells[2].InnerText);

				player.Overall = int.Parse(cells[3].Descendants().First(n => n.Name == "em").InnerText);
				player.Potential = int.Parse(cells[4].Descendants().First(n => n.Name == "em").InnerText);

				var start = cells[5].InnerText.IndexOf('(') + 1;
				var length = cells[5].InnerText.IndexOf(')') - start;
				player.JerseyNumber = int.Parse(cells[5].InnerText.Substring(start, length));

				player.Photo = cells[0].Descendants().First(n => n.Name == "img").GetAttributeValue("data-srcset", default(string));

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
