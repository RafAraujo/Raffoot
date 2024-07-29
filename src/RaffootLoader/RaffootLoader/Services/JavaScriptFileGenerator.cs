using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Services.Interfaces;
using RaffootLoader.Utils;
using System.Text;

namespace RaffootLoader.Services
{
	public class JavaScriptFileGenerator(ISettings settings, IContext context) : IJavaScriptFileGenerator
	{
		private readonly ISettings _settings = settings;
		private readonly IContext _context = context;

		public void GenerateSoFifaServiceFile(int year)
		{
			try
			{
				Console.WriteLine("Generating SoFifaService file...");

				var version = year.ToString().Substring(2, 2);
				var fileName = $"SoFifa{version}Service";
				var filePath = Path.Combine(_settings.BasePath, "Raffoot.Application", $"{fileName}.js");

				var sb = new StringBuilder();

				sb.AppendLine(string.Format("class {0} {{", fileName));

				sb.AppendLine("\tstatic seedCountries() {");
				sb.AppendLine("\t\tconst c = Country.create;");
				sb.AppendLine();

				var countries = _context.Countries.OrderBy(c => c.Name);
				var leagues = _context.Leagues;

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

				var countryNames = countries.Select(c => c.Name).ToList();
				var positions = _context.Positions.Select(p => p.Abbreviation).ToList();

				foreach (var league in leagues)
				{
					var country = _context.Countries.Single(c => c.Name == league.Country);
					var clubs = _context.Clubs.Where(c => c.LeagueId == league.ExternalId);

					foreach (var club in clubs)
					{
						var shortName = GetShortName(club.Name);

						sb.AppendLine(string.Format("\t\tx = c(\"{0}\", {1}, \"{2}\", \"{3}\", {4}, {5});",
							club.Name,
							countryNames.IndexOf(country.Name) + 1,
							club.BackgroundColor,
							club.ForegroundColor,
							club.ExternalId,
							string.IsNullOrEmpty(shortName) ? "null" : $"\"{shortName}\""));

						foreach (var player in _context.Players.Where(p => p.ClubId == club.ExternalId))
						{
							sb.AppendLine(string.Format("\t\tp(\"{0}\", {1}, {2}, {3}, {4}, x, {5});",
								player.Name,
								countryNames.IndexOf(player.Country) + 1,
								positions.IndexOf(player.Positions.First()) + 1,
								player.Age,
								player.Overall,
								player.ExternalId));
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

		private static string GetShortName(string clubName)
		{
			var clubs = new List<Tuple<string, string>>
			{
				new("Barcelona Guayaquil", "Barcelona SC"),
				new("Bayer 04 Leverkusen", "Bayer Leverkusen"),
				new("Borussia Mönchengladbach", "B. M'gladbach"),
				new("Borussia Dortmund", "B. Dortmund"),
				new("Borussia Dortmund II", "B. Dortmund II"),
				new("Brighton & Hove Albion", "Brighton"),
				new("Cangzhou Mighty Lions", "Mighty Lions"),
				new("Chengdu Rongcheng", "Rongcheng"),
				new("CSM Politehnica Iași", "Politehnica Iași"),
				new("DSC Arminia Bielefeld", "Arminia Bielefeld"),
				new("Eintracht Braunschweig", "E. Braunschweig"),
				new("FC Bayern München", "Bayern München"),
				new("Forest Green Rovers", "Forest Green"),
				new("Independiente del Valle", "I. del Valle"),
				new("Independiente Medellín", "I. Medellín"),
				new("Jagiellonia Białystok", "Jagiellonia"),
				new("Milton Keynes Dons", "MK Dons"),
				new("Northampton Town", "Northampton"),
				new("Olympique de Marseille", "Marseille"),
				new("Olympique Lyonnais", "Lyon"),
				new("Paris Saint Germain", "PSG"),
				new("Peterborough United", "Peterborough"),
				new("Puszcza Niepołomice", "Puszcza"),
				new("Queens Park Rangers", "QPR"),
				new("Raków Częstochowa", "Raków"),
				new("San Jose Earthquakes", "SJ Earthquakes"),
				new("Sheffield Wednesday", "Sheffield Wed."),
				new("SpVgg Greuther Fürth", "Greuther Fürth"),
				new("Tianjin Jinmen Tiger", "Jinmen Tiger"),
				new("Técnico Universitario", "T. Universitario"),
				new("Tottenham Hotspur", "Tottenham"),
				new("Union Saint-Gilloise", "Union SG"),
				new("Universidad Católica", "U. Católica"),
				new("Universitatea Craiova", "U. Craiova"),
				new("Vancouver Whitecaps", "Whitecaps"),
				new("Waldhof Mannheim", "Waldhof 07"),
				new("West Bromwich Albion", "West Brom"),
				new("Wolverhampton Wanderers", "Wolverhampton"),
				new("Wuhan Three Towns", "Three Towns"),
				new("Wycombe Wanderers", "Wycombe"),
			};

			var shortName = clubs.SingleOrDefault(c => c.Item1 == clubName);
			return shortName?.Item2;
		}
	}
}
