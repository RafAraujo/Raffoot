using HtmlAgilityPack;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.DTO;
using RaffootLoader.Services.Fifa.Abstract;
using RaffootLoader.Utils;
using System.Net;

namespace RaffootLoader.Services.PES
{
	public class WePesStatsWebScraperService(ISettings settings) : PesService, IDataExtractorService
	{
		private const string BaseUrl = "https://wepesstats.rf.gd/";
		private readonly HttpClient client = GetHttpClient();

		private readonly List<League> leagues = [];
		private readonly List<Club> clubs = [];
		private readonly List<Player> players = [];
		private readonly List<Country> countries = [];

		public async Task<DatabaseDto> GetDatabase()
		{
			var database = new DatabaseDto();

			await GetData().ConfigureAwait(false);

			database.Year = settings.Year;
			database.Leagues = leagues;
			database.Clubs = clubs;
			database.Players = players;
			database.Countries = countries;

			return database;
		}

		private string GetUrl()
		{
			var gameName = string.Empty;

			switch (settings.Year)
			{
				case 2003:
					gameName = "pes3";
					break;
				case 2004:
					gameName = "pes4";
					break;
			}

			var url = $"{BaseUrl}{gameName}.php";

			return url;
		}

		private async Task<List<Player>> GetData()
		{
			var players = new List<Player>();

			Console.WriteLine();

			var url = GetUrl();

			var doc = await GetHtmlDocument(url);
			var divPagination = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'pagination')]");
			var lastLink = divPagination.SelectSingleNode(".//a[last()]");
			var maxPage = int.Parse(lastLink.InnerText);

			for (var page = 1; page <= maxPage; page++)
			{
				url = $"{url}?page={page}";
				doc = await GetHtmlDocument(url);

				GetData(doc);

				ConsoleUtils.ShowProgress(page, maxPage, $"Players: ");
			}

			Console.WriteLine();

			return players;
		}

		private void GetData(HtmlDocument doc)
		{
			var table = doc.DocumentNode.SelectSingleNode("//table[2]");
			var tbody = table.Descendants().First(n => n.Name == "tbody");
			var rows = tbody.Descendants().Where(n => n.Name == "tr");

			foreach (var tr in rows)
			{
				var cells = tr.Descendants().Where(n => n.Name == "td").ToList();

				var clubName = cells[5].InnerText;
				if (!clubs.Any(c => c.Name == clubName))
					clubs.Add(new Club { Name = clubName });

				var countryName = GetStandardizedCountryName(cells[6].InnerText);
				if (!countries.Any(c => c.Name == countryName))
					countries.Add(new Country(countryName, null, null));

				var position = GetStandardizedPositionAbbreviation(cells[9].InnerText, cells[8].InnerText);
				var overall = int.Parse(cells[11].InnerText);

				var player = new Player
				{
					ExternalId = int.Parse(cells[0].InnerText),
					Name = cells[1].InnerText,
					Age = int.Parse(cells[2].InnerText),
					Country = countryName,
					Positions = [position],
					Overall = overall,
					Potential = overall,
				};

				players.Add(player);
			}
		}

		public static string GetStandardizedPositionAbbreviation(string position, string foot)
		{
			return (position, foot) switch
			{
				("SW", "Left") or ("SW", "Right") => "CB",
				("SB", "Left") => "LB",
				("SB", "Right") => "RB",
				("DMF", "Left") or ("DMF", "Right") => "CDM",
				("CMF", "Left") or ("CMF", "Right") => "CM",
				("SMF", "Left") => "LM",
				("SMF", "Right") => "RM",
				("OMF", "Left") or ("OMF", "Right") => "CAM",
				("WG", "Left") => "LW",
				("WG", "Right") => "RW",
				("CF", "Left") or ("CF", "Right") => "ST",
				_ => position,
			};
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
			client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36");

			var cookie = new Cookie("__test", "d95ad17f468c0aa8f93602c795af214b");
			cookieContainer.Add(new Uri(BaseUrl), cookie);

			return client;
		}
	}
}
