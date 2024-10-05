using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Services.Fifa.Abstract;
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

				var version = settings.Year.ToString().Substring(2, 2);
				var fileName = $"Fifa{version}Service";
				var filePath = Path.Combine(settings.BaseFolder, "Raffoot.Application", $"{fileName}.js");

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

				var countryNames = countries.Select(c => c.Name).ToList();
				var positions = context.Positions.Select(p => p.Abbreviation).ToList();

				var leagues = context.Leagues;
				var clubs = context.Clubs;
				var players = context.Players;

				foreach (var league in leagues)
				{
					var country = countries.SingleOrDefault(c => c.Name == league.Country);
					var leagueClubs = clubs.Where(c => c.LeagueId == league.ExternalId);

					foreach (var club in leagueClubs)
					{
						if (country == null && league.Country == "Rest of World")
						{
							country = countries.Single(c => c.Name == FifaService.GetCountryForRestOfWorldClub(club));
						}

						var shortName = FifaService.GetShortClubName(club.Name);

						sb.AppendLine(string.Format("\t\tx = c(\"{0}\", {1}, \"{2}\", \"{3}\", {4});",
							club.Name,
							countryNames.IndexOf(country.Name) + 1,
							club.BackgroundColor,
							club.ForegroundColor,
							string.IsNullOrEmpty(shortName) ? "null" : $"\"{shortName}\""));

						foreach (var player in players.Where(p => p.ClubId == club.ExternalId))
						{
							var position = FifaService.GetStandardizedPositionAbbreviation(player.Positions.First());

							var countryId = countryNames.IndexOf(player.Country) + 1;
							var positionId = positions.IndexOf(position) + 1;

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
	}
}
