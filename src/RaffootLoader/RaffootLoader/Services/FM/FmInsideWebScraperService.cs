using HtmlAgilityPack;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Abstract;
using RaffootLoader.Services.DTO;
using RaffootLoader.Utils;

namespace RaffootLoader.Services.FM
{
	public class FmInsideWebScraperService(ISettings settings) : WebScraperServiceBase, IDataExtractorService
	{
		private readonly HttpClient client = GetHttpClient();

		private List<Country> countries = [];

		public async Task<DatabaseDto> GetDatabase()
		{
			var database = new DatabaseDto();

			var leagues = GetLeagues();

			foreach (var league in leagues)
			{
				var filePath = Path.Combine(settings.ConsoleAppFolder, "Resources", "FM", $"{league.Country}.html");
				var doc = GetHtmlDocument(filePath);
				var clubs = GetClubs(doc, league);
				var players = await GetPlayers(league, clubs).ConfigureAwait(false);
				countries = [.. countries.OrderBy(c => c.Name)];

				database.Year = settings.Year;
				database.Leagues.AddRange(leagues);
				database.Clubs.AddRange(clubs);
				database.Players.AddRange(players);
				database.Countries.AddRange(countries);
			}

			return database;
		}

		private List<League> GetLeagues()
		{
			var folder = Path.Combine(settings.ConsoleAppFolder, "Resources", "FM");
			var files = Directory.GetFiles(folder, "*.html");
			var leagues = files.Select((f, i) => new League(i + 1, Path.GetFileNameWithoutExtension(f), 1, null)).ToList();
			return leagues;
		}

		private static List<Club> GetClubs(HtmlDocument doc, League league)
		{
			var clubs = new List<Club>();

			var ulList = doc.DocumentNode.SelectNodes("//div[@id='club_table']//div[contains(@class, 'clubs')]//ul[contains(@class, 'club')]");

			foreach (var ul in ulList)
			{
				var spanLogo = ul.SelectSingleNode("./li[contains(@class, 'club')]/span[contains(@class, 'image')]");
				var linkName = ul.SelectSingleNode("./li[contains(@class, 'club')]/span[contains(@class, 'name')]/b/a");
				var liLeague = ul.SelectSingleNode("./li[contains(@class, 'league')]");

				var logo = string.Format("{0}{1}", "https://", spanLogo.GetAttributeValue("style", default(string)).Split(' ')[1][6..].TrimEnd(')'));
				var externalId = int.Parse(Path.GetFileNameWithoutExtension(logo));

				if (clubs.Any(c => c.ExternalId == externalId))
					continue;

				var club = new Club
				{
					ExternalId = externalId,
					Name = linkName.InnerText,
					Logo = logo,
					LeagueId = league.ExternalId,
					Link = linkName.GetAttributeValue("href", default(string)),
				};

				clubs.Add(club);
			}

			return clubs;
		}

		private async Task<List<Player>> GetPlayers(League league, List<Club> clubs)
		{
			var players = new List<Player>();

			var current = 0;

			foreach (var club in clubs)
			{
				ConsoleUtils.ShowProgress(++current, clubs.Count, $"Getting {club.Name} players: ");

				var doc = await GetHtmlDocument(client, club.Link).ConfigureAwait(false);

				var nodesFullSquad = doc.DocumentNode.SelectNodes("(//div[@id='player_table'][.//h2[text()='Full Squad']])//ul[contains(@class, 'player')]");
				if (nodesFullSquad == null)
					continue;

				var onLoan = new List<Player>();
				var nodesOnLoan = doc.DocumentNode.SelectNodes("(//div[@id='player_table'][.//h2[text()='On loan']])//ul[contains(@class, 'player')]");
				if (nodesOnLoan != null)
					onLoan = GetPlayers(nodesOnLoan, club, league);

				var fullSquad = GetPlayers(nodesFullSquad, club, league);

				foreach (var player in fullSquad)
					if (onLoan.Any(p => player.ExternalId == p.ExternalId))
						player.OnLoan = true;

				players.AddRange(fullSquad);
			}

			RemoveDuplicatePlayers(players);
			RemoveClubsWithFewPlayers(clubs, players);

			ConsoleUtils.ShowProgress(current, clubs.Count, $"Players: ");
			Console.WriteLine();

			return players;
		}

		private List<Player> GetPlayers(HtmlNodeCollection nodes, Club club, League league)
		{
			var players = new List<Player>();

			foreach (var node in nodes)
			{
				var spanOverall = node.SelectSingleNode("./li[contains(@class, 'rating')]/span");
				var imgPhoto = node.SelectSingleNode("./li[contains(@class, 'player')]/span[contains(@class, 'image')]/img");
				var spanName = node.SelectSingleNode("./li[contains(@class, 'player')]/span[contains(@class, 'name')]");
				var imgCountry = spanName.SelectSingleNode("./b/img");
				var linkName = spanName.SelectSingleNode("./b/a");
				var spansPositions = spanName.SelectNodes("./span[contains(@class, 'desktop_positions')]/span[contains(@class, 'position') and contains(@class, 'natural')]");
				var liAge = node.SelectSingleNode("./li[contains(@class, 'age')]");

				var linkNameHref = Path.GetFileNameWithoutExtension(linkName.GetAttributeValue("href", default(string)));
				var externalId = int.Parse(linkNameHref[..linkNameHref.IndexOf('-')]);

				var photo = string.Format("{0}{1}", "https://", imgPhoto.GetAttributeValue("src", default(string)).TrimStart([.. "//"]));
				if (Path.GetFileNameWithoutExtension(photo) == "default-2020")
					photo = null;

				var player = new Player
				{
					ExternalId = externalId,
					Name = linkName.InnerText,
					FullName = linkName.InnerText,
					Age = int.Parse(liAge.InnerText),
					Country = imgCountry.GetAttributeValue("code", default(string)),
					ClubId = club.ExternalId,
					Positions = spansPositions.Select(s => GetStandardizedPositionAbbreviation(s.InnerText)).ToList(),
					Overall = int.Parse(spanOverall.InnerText),
					Potential = int.Parse(spanOverall.InnerText),
					Photo = photo,
				};

				if (!countries.Any(c => c.Name == player.Country))
				{
					var flag = string.Format("{0}{1}", "https://", imgCountry.GetAttributeValue("src", default(string)).TrimStart([.. "//"]));
					var continent = league.Continent;
					countries.Add(new Country(player.Country, flag, continent.ToString()));
				}

				players.Add(player);
			}

			return players;
		}

		private static void RemoveDuplicatePlayers(List<Player> players)
		{
			var groupedByExternalId = players.GroupBy(p => p.ExternalId);
			foreach (var group in groupedByExternalId.Where(g => g.Count() > 1))
				players.Remove(group.Single(p => !p.OnLoan));
		}

		private static void RemoveClubsWithFewPlayers(List<Club> clubs, List<Player> players)
		{
			foreach (var club in clubs.ToList())
			{
				var clubPlayers = players.Where(p => p.ClubId == club.ExternalId);
				if (clubPlayers.Count() < Club.MinimumPlayersInSquad)
				{
					players.RemoveAll(p => p.ClubId == club.ExternalId);
					clubs.Remove(club);
				}
			}
		}

		private static string GetStandardizedPositionAbbreviation(string position)
		{
			return position switch
			{
				"DC" => "CB",
				"DR" => "RB",
				"DL" => "LB",
				"WBR" => "RWB",
				"WBL" => "LWB",
				"DM" => "CDM",
				"MC" or "MCR" or "MCL" => "CM",
				"MR" => "RM",
				"ML" => "LM",
				"AMC" => "CAM",
				"AMR" => "RW",
				"AML" => "LW",
				_ => position,
			};
		}
	}
}
