using RaffootLoader.Data;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Interfaces;
using RaffootLoader.Utils;
using System.Drawing;
using System.Dynamic;
using System.Text;
using System.Text.Json;

namespace RaffootLoader.Services
{
	public class JavaScriptFileGenerator : IJavaScriptFileGenerator
	{
		private readonly ISettings _settings;
		private readonly IContext _context;

		public JavaScriptFileGenerator(ISettings settings, IContext context)
		{
			_settings = settings;
			_context = context;
		}

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
						sb.AppendLine(string.Format("\t\tx = c(\"{0}\", {1}, \"{2}\", \"{3}\", {4});",
							club.Name,
							countryNames.IndexOf(country.Name) + 1,
							club.BackgroundColor,
							club.ForegroundColor,
							club.ExternalId));

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

		public void GenerateMultiLanguageFile()
		{
			try
			{
				Console.WriteLine("Generating MultiLanguage file...");

				const string sourceLanguage = "en";
				const string FileName = "MultiLanguage";
				var filePath = Path.Combine(_settings.BasePath, "Raffoot.Domain", $"{FileName}.js");

				var languages = Context.Languages;

				var translations = _context.Translations.ToList();
				var englishTranslations = translations
					.Select(t => t.OriginalText).Distinct()
					.Select(t => new Translation(t, t, sourceLanguage))
					.ToList();
				translations.AddRange(englishTranslations);

				dynamic json = new ExpandoObject();

				foreach (var language in languages)
				{
					dynamic languageProperty = new ExpandoObject();
					(json as IDictionary<string, object>).Add(language, languageProperty);

					foreach (var translation in translations.Where(t => t.Language == language).OrderBy(t => t.OriginalText))
					{
						translation.TranslatedText = translation.TranslatedText.WithFirstCharUppercase();
						(languageProperty as IDictionary<string, object>).Add(translation.OriginalText, translation.TranslatedText);
					}
				}

				var serialized = JsonSerializer.Serialize(json, new JsonSerializerOptions { WriteIndented = true });

				var sb = new StringBuilder();

				sb.AppendLine("const MultiLanguage = ");
				sb.Append(serialized);
				sb.Append(';');

				File.WriteAllText(filePath, sb.ToString());
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}
		}

		private static Rectangle CropRectangle(Rectangle original, decimal newWidthPercentage, decimal newHeightPercentage)
		{
			var croppedWidth = original.Width * newWidthPercentage;
			var croppedHeight = original.Width * newHeightPercentage;

			var width = original.Width - (int)croppedWidth;
			var height = original.Width - (int)croppedHeight;

			var x = (int)croppedWidth / 2;
			var y = (int)croppedHeight / 2;

			var rectangle = new Rectangle(x, y, width, height);
			return rectangle;
		}
	}
}
