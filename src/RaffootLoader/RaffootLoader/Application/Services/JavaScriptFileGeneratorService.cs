using NUglify;
using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Infrastructure.CrossCutting.Utils;
using System.Text;

namespace RaffootLoader.Application.Services
{
	public class JavaScriptFileGeneratorService(ISettings settings, IContext context) : IJavaScriptFileGeneratorService
	{
		public void GenerateFifaServiceFile(bool minify = false)
		{
			try
			{
				Console.WriteLine("Generating FifaService file...");

				var version = settings.Year.ToString()[2..];
				var fileName = $"{settings.DataSource}{version}Service";
				var filePath = Path.Combine(settings.GameBaseFolder, "Raffoot.Application", "Services", $"{fileName}.js");

				var sb = new StringBuilder();

				sb.AppendLine(string.Format("class {0} {{", fileName));

				sb.AppendLine("\tstatic seedCountries() {");
				sb.AppendLine("\t\tconst c = Country.create;");
				sb.AppendLine();

				var countries = context.Countries.OrderBy(c => c.Name);

				foreach (var country in countries)
					sb.AppendLine(string.Format("\t\tc(\"{0}\"{1});",
						country.Name,
						string.IsNullOrEmpty(country.Continent) ? string.Empty : $", {(int)Enum.Parse<Continent>(country.Continent)}"));

				sb.AppendLine("\t}").AppendLine();

				sb.AppendLine("\tstatic seedClubs() {");
				sb.AppendLine("\t\tconst c = Club.create;");
				sb.AppendLine("\t\tconst p = Player.create;");
				sb.AppendLine();

				var countryNames = countries.Select(c => c.Name).ToList();
				var positions = context.Positions.Select(p => p.Abbreviation).ToList();

				var clubs = context.Clubs.OrderBy(c => c.Id);
				var players = context.Players.OrderBy(p => p.Id);

				if (settings.DataSource == DataSource.FM)
					clubs = clubs.Where(c => c.Country == "Brazil").OrderBy(c => c.Id);

				foreach (var club in clubs)
				{
					var clubShortName = GetShortClubName(club.Name);

					sb.AppendLine(string.Format("\t\tc(\"{0}\", {1}, {2}{3}",
						club.Name,
						countryNames.IndexOf(club.Country) + 1,
						string.IsNullOrEmpty(club.BackgroundColor) ? "null" : $"\"{club.BackgroundColor}\"",
						string.IsNullOrEmpty(clubShortName) ? ");" : $", \"{clubShortName}\");"));

					foreach (var player in players.Where(p => p.ClubId == club.ExternalId))
					{
						var position = player.Positions.First();
						var countryId = countryNames.IndexOf(player.Country) + 1;
						var positionId = positions.IndexOf(position) + 1;

						if (positionId == 0)
							throw new Exception($"Position {position} not found");

						sb.AppendLine(string.Format("\t\tp(\"{0}\", {1}, {2}, {3}, {4});",
							player.Name,
							countryId,
							positionId,
							player.Age,
							player.Overall));
					}

					sb.AppendLine();
				}
				sb.AppendLine("\t}").AppendLine();
				sb.Append('}');

				var js = sb.ToString();
				if (minify)
					js = Uglify.Js(js).Code;

				File.WriteAllText(filePath, js);
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
				"Academia Puerto Cabello" => "Puerto Cabello",
				"Asociación Deportiva Tarma" => "ADT",
				"Barcelona Guayaquil" => "Barcelona SC",
				"Bayer 04 Leverkusen" => "Bayer Leverkusen",
				"Borussia Mönchengladbach" => "B. M'gladbach",
				"Borussia Dortmund" => "B. Dortmund",
				"Borussia Dortmund II" => "B. Dortmund II",
				"Brighton & Hove Albion" => "Brighton",
				"Cangzhou Mighty Lions" => "Mighty Lions",
				"Chengdu Rongcheng" => "Rongcheng",
				"Chongqing Dangdai Lifan" => "Chongqing Dangdai",
				"CSM Politehnica Iași" => "Politehnica Iași",
				"DSC Arminia Bielefeld" => "Arminia Bielefeld",
				"Deportivo Binacional" => "Binacional",
				"Dyskobolia Grodzisk Wielkopolski" => "Dyskobolia",
				"Eintracht Braunschweig" => "E. Braunschweig",
				"FC Bayern München" => "Bayern München",
				"Forest Green Rovers" => "Forest Green",
				"Independiente del Valle" => "I. del Valle",
				"Independiente Medellín" => "I. Medellín",
				"Independiente Petrolero" => "I. Petrolero",
				"Independiente Rivadavia" => "I. Rivadavia",
				"Jagiellonia Białystok" => "Jagiellonia",
				"Llagostera-Costa Brava" => "UE Costa Brava",
				"Milton Keynes Dons" => "MK Dons",
				"Northampton Town" => "Northampton",
				"Olympiakos Piraeus" => "Olympiakos",
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
				"Stade Lausanne-Ouchy" => "SLO",
				"Tianjin Jinmen Tiger" => "Jinmen Tiger",
				"Técnico Universitario" => "T. Universitario",
				"Tottenham Hotspur" => "Tottenham",
				"Union Saint-Gilloise" => "Union SG",
				"Universidad Católica" => "U. Católica",
				"Universitatea Craiova" => "U. Craiova",
				"Universidad de Concepción" => "U. Concepción",
				"Universitatea de Vinto" => "U. Vinto",
				"Vancouver Whitecaps" => "Whitecaps",
				"Waldhof Mannheim" => "Waldhof 07",
				"West Bromwich Albion" => "West Brom",
				"Western Sydney Wanderers" => "Western Sydney",
				"Wolverhampton Wanderers" => "Wolverhampton",
				"Wuhan Three Towns" => "Three Towns",
				"Wycombe Wanderers" => "Wycombe",
				_ => null,
			};
		}
	}
}
