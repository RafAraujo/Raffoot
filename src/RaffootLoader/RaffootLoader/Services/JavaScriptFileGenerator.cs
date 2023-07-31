using Newtonsoft.Json;
using RaffootLoader.Data;
using RaffootLoader.Domain.Models;
using RaffootLoader.Utils;
using System.Drawing;
using System.Dynamic;
using System.Text;

namespace RaffootLoader.Services
{
    public class JavaScriptFileGenerator
    {
        private readonly Context _context;
        private readonly string _basePath;
        private readonly string _imagesFolder;

        public JavaScriptFileGenerator(Context context, string basePath, string imagesPath)
        {
            _context = context;
            _basePath = basePath;
            _imagesFolder = imagesPath;
        }

        public void GenerateSoFifaServiceFile()
        {
            try
            {
                Console.WriteLine("Generating SoFifaService file...");

                var version = DateTime.Now.ToString("yy");
                var fileName = $"SoFifa{version}Service";
                var filePath = Path.Combine(_basePath, "Raffoot.Services", $"{fileName}.js");

                var sb = new StringBuilder();

                sb.AppendLine(string.Format("class {0} {{", fileName));

                sb.AppendLine("\tstatic seedCountries() {");
                foreach (var country in _context.Countries.OrderBy(c => c.Name))
                    sb.AppendLine(string.Format("\t\tCountry.create(\"{0}\");", country.Name));
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
                        sb.AppendLine(string.Format("\t\tclub = Club.create(\"{0}\", \"{1}\", {2});", club.Name, country.Name, club.ExternalId));

                        foreach (var player in _context.Players.Where(p => p.ClubId == club.ExternalId))
                        {
                            sb.AppendLine(string.Format("\t\tPlayer.create(\"{0}\", \"{1}\", [{2}], {3}, {4}, club, {5});",
                                player.Name,
                                player.Country,
                                string.Join(", ", player.Positions.Select(p => $"'{p}'")),
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
                var filePath = Path.Combine(_basePath, "Raffoot.Domain", $"{FileName}.js");

                var languages = Context.Languages;

                var translations = _context.Translations.ToList();
                var englishTranslations = translations
                    .ToList()
                    .Where(t => t.Language == translations.Select(t => t.Language).Where(l => l != sourceLanguage).First())
                    .Select(t => new Translation(t.OriginalText, t.OriginalText, sourceLanguage));
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

        public void GenerateColorManagerFile()
        {
            try
            {
                if (!OperatingSystem.IsWindows())
                {
                    Console.WriteLine("OS is not Windows");
                    return;
                }

                Console.WriteLine("Generating ColorManager file...");

                const string FileName = "ColorManager";
                var filePath = Path.Combine(_basePath, "Raffoot.Services", $"{FileName}.js");

                var service = new BitmapService();
                var sb = new StringBuilder();

                sb.AppendLine(string.Format("class {0} {{", FileName));

                sb.AppendLine("\tstatic setClubsColors() {");

                var clubs = _context.Clubs.OrderBy(c => c.Name);
                var leagues = _context.Leagues;
                var progress = 0d;

                Parallel.ForEach(clubs, club =>
                {
                    var mainKitPath = @$"{_imagesFolder}\kits\{club.ExternalId}\1.png";

                    if (File.Exists(mainKitPath) && OperatingSystem.IsWindows())
                    {
                        using var originalBitmap = BitmapService.ConvertToBitmap(mainKitPath);
                        var backColor = BitmapService.GetAverageColor(originalBitmap);
                        var foreColor = BitmapService.PerceivedBrightness(backColor) > 130 ? Color.Black : Color.White;

                        sb.AppendLine(string.Format("\t\tContext.game.clubs.find(c => c.name === \"{0}\" && c.country.name === \"{1}\").setColors('{2}', '{3}');",
                            club.Name,
                            leagues.Single(l => l.ExternalId == club.LeagueId).Country,
                            $"rgb({backColor.R},{backColor.G},{backColor.B})",
                            foreColor.Name.ToLower()));

                        Console.Write("\r{0}%", Math.Round(++progress / clubs.Count() * 100));
                    }
                });

                sb.AppendLine("\t}").AppendLine();

                sb.Append('}');

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
