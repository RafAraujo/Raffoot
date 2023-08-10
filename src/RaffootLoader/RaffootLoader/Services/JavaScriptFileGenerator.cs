using Newtonsoft.Json;
using RaffootLoader.Data;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Interfaces;
using RaffootLoader.Utils;
using System.Drawing;
using System.Dynamic;
using System.Text;

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

        public void GenerateSoFifaServiceFile()
        {
            try
            {
                Console.WriteLine("Generating SoFifaService file...");

                var version = DateTime.Now.ToString("yy");
                var fileName = $"SoFifa{version}Service";
                var filePath = Path.Combine(_settings.BasePath, "Raffoot.Services", $"{fileName}.js");

                var sb = new StringBuilder();

                sb.AppendLine(string.Format("class {0} {{", fileName));

                sb.AppendLine("\tstatic seedCountries() {");
                foreach (var country in _context.Countries.OrderBy(c => c.Name))
                    sb.AppendLine(string.Format("\t\tCountry.create(\"{0}\", {1});",
                        country.Name,
                        string.IsNullOrEmpty(country.Continent) ? "null" : $"\"{country.Continent}\""));
                sb.AppendLine("\t}").AppendLine();

                sb.AppendLine("\tstatic seedClubs() {");
                sb.AppendLine("\t\tlet club = null;");
                sb.AppendLine();

                foreach (var league in _context.Leagues)
                {
                    var country = _context.Countries.Single(c => c.Name == league.Country);
                    var clubs = _context.Clubs.Where(c => c.LeagueId == league.ExternalId);

                    foreach (var club in clubs)
                    {
                        sb.AppendLine(string.Format("\t\tclub = Club.create(\"{0}\", \"{1}\", {2}, \"{3}\", \"{4}\");",
                            club.Name,
                            country.Name,
                            club.ExternalId,
                            club.BackgroundColor,
                            club.ForegroundColor));

                        foreach (var player in _context.Players.Where(p => p.ClubId == club.ExternalId))
                        {
                            sb.AppendLine(string.Format("\t\tPlayer.create(\"{0}\", \"{1}\", \"{2}\", [{3}], {4}, {5}, club, {6}, {7});",
                                player.FullName,
                                player.Name,
                                player.Country,
                                string.Join(", ", player.Positions.Select(p => $"'{p}'")),
                                player.Age,
                                player.Overall,
                                player.ExternalId,
                                player.HasPhoto.ToString().ToLower()));
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

                var serialized = JsonConvert.SerializeObject(json, Formatting.Indented);

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
