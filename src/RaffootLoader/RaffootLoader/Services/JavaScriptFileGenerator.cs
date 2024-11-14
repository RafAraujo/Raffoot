using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Utils;
using System.Text;

namespace RaffootLoader.Services
{
	public class JavaScriptFileGenerator(ISettings settings, IContext context) : IJavaScriptFileGenerator
	{
		public void GenerateFifaServiceFile()
		{
			try
			{
				Console.WriteLine("Generating FifaService file...");

				var version = settings.Year.ToString()[2..];
				var prefix = settings.DataSource == DataSource.FifaPes ? "Fifa" : "Fm";
				var fileName = $"{prefix}{version}Service";
				var filePath = Path.Combine(settings.GameBaseFolder, "Raffoot.Application", "Services", $"{fileName}.js");

				var sb = new StringBuilder();

				sb.AppendLine(string.Format("class {0} {{", fileName));

				sb.AppendLine("\tstatic seedCountries() {");
				sb.AppendLine("\t\tconst c = Country.create;");
				sb.AppendLine();

				var countries = context.Countries.OrderBy(c => c.Name).ToList();

				foreach (var country in countries)
				{
					sb.AppendLine(string.Format("\t\tc(\"{0}\"{1});",
						country.Name,
						string.IsNullOrEmpty(country.Continent) ? string.Empty : $", {(int)Enum.Parse(typeof(Continent), country.Continent)}"));
				}

				sb.AppendLine("\t}").AppendLine();

				sb.AppendLine("\tstatic seedClubs() {");
				sb.AppendLine("\t\tconst c = Club.create;");
				sb.AppendLine("\t\tconst p = Player.create;");
				sb.AppendLine("\t\tlet x = null;");
				sb.AppendLine();
				sb.AppendLine("\t\tconst b = \"#000000\";");
				sb.AppendLine("\t\tconst w = \"#FFFFFF\";");
				sb.AppendLine();

				var countryNames = countries.Select(c => c.Name).ToList();
				var positions = context.Positions.Select(p => p.Abbreviation).ToList();

				var leagues = context.Leagues.OrderBy(l => l.IsPatched).ThenBy(l => l.Id);
				var clubs = context.Clubs.OrderBy(c => c.Id);
				var players = context.Players.OrderBy(p => p.Id);

				foreach (var league in leagues)
				{
					var country = countries.SingleOrDefault(c => c.Name == league.Country);
					var leagueClubs = clubs.Where(c => c.LeagueId == league.ExternalId);

					foreach (var club in leagueClubs)
					{
						var clubShortName = GetShortClubName(club.Name);

						sb.AppendLine(string.Format("\t\tx = c(\"{0}\", {1}, \"{2}\", {3}, {4});",
							club.Name,
							countryNames.IndexOf(country.Name) + 1,
							club.BackgroundColor,
							club.ForegroundColor == "#FFFFFF" ? "w" : "b",
							string.IsNullOrEmpty(clubShortName) ? "null" : $"\"{clubShortName}\""));

						foreach (var player in players.Where(p => p.ClubId == club.ExternalId))
						{
							var position = player.Positions.First();
							var countryId = countryNames.IndexOf(player.Country) + 1;
							var positionId = positions.IndexOf(position) + 1;

							if (positionId == 0)
								throw new Exception($"Position {position} not found");

							sb.AppendLine(string.Format("\t\tp(\"{0}\", {1}, {2}, {3}, {4}, x);",
								player.Name,
								countryId,
								positionId,
								player.Age,
								player.Overall));
						}

						sb.AppendLine();
					}
				}
				sb.AppendLine("\t}").AppendLine();
				sb.Append('}');

				File.WriteAllText(filePath, sb.ToString());
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}
		}

		protected static string GetShortClubName(string clubName)
		{
			return clubName switch
			{
				"Barcelona Guayaquil" => "Barcelona SC",
				"Bayer 04 Leverkusen" => "Bayer Leverkusen",
				"Borussia Mönchengladbach" => "B. M'gladbach",
				"Borussia Dortmund" => "B. Dortmund",
				"Borussia Dortmund II" => "B. Dortmund II",
				"Brighton & Hove Albion" => "Brighton",
				"Cangzhou Mighty Lions" => "Mighty Lions",
				"Chengdu Rongcheng" => "Rongcheng",
				"CSM Politehnica Iași" => "Politehnica Iași",
				"DSC Arminia Bielefeld" => "Arminia Bielefeld",
				"Eintracht Braunschweig" => "E. Braunschweig",
				"FC Bayern München" => "Bayern München",
				"Forest Green Rovers" => "Forest Green",
				"Independiente del Valle" => "I. del Valle",
				"Independiente Medellín" => "I. Medellín",
				"Jagiellonia Białystok" => "Jagiellonia",
				"Milton Keynes Dons" => "MK Dons",
				"Northampton Town" => "Northampton",
				"Olympique de Marseille" => "Marseille",
				"Olympique Lyonnais" => "Lyon",
				"Paris Saint Germain" => "PSG",
				"Peterborough United" => "Peterborough",
				"Puszcza Niepołomice" => "Puszcza",
				"Queens Park Rangers" => "QPR",
				"Raków Częstochowa" => "Raków",
				"San Jose Earthquakes" => "SJ Earthquakes",
				"Sheffield Wednesday" => "Sheffield Wed.",
				"SpVgg Greuther Fürth" => "Greuther Fürth",
				"Tianjin Jinmen Tiger" => "Jinmen Tiger",
				"Técnico Universitario" => "T. Universitario",
				"Tottenham Hotspur" => "Tottenham",
				"Union Saint-Gilloise" => "Union SG",
				"Universidad Católica" => "U. Católica",
				"Universitatea Craiova" => "U. Craiova",
				"Vancouver Whitecaps" => "Whitecaps",
				"Waldhof Mannheim" => "Waldhof 07",
				"West Bromwich Albion" => "West Brom",
				"Wolverhampton Wanderers" => "Wolverhampton",
				"Wuhan Three Towns" => "Three Towns",
				"Wycombe Wanderers" => "Wycombe",
				_ => null,
			};
		}
	}
}
