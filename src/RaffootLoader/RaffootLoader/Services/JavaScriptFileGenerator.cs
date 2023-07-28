using Newtonsoft.Json;
using RaffootLoader.Data;
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

        public async Task GenerateMultiLanguageFile()
        {
            try
            {
                Console.WriteLine("Generating MultiLanguage file...");

                const string PrefixOfContext = "Football - ";

                const string FileName = "MultiLanguage";
                var filePath = Path.Combine(_basePath, "Raffoot.Domain", $"{FileName}.js");

                var texts = new List<string>()
                {
                    "Age", "Assists", "Audience", "Away",
                    "Back", "Bronze",
                    "Calendar", "Cancel", "Capacity", "Category", "Champions", "Classification Tables", "Clear", "Club", "Clubs", "Choose your club", "Contract", "Country", "Creating game...", "Cup",
                    "Date", "Delete",
                    "End of Contract", "Energy", "Error", "Expand",
                    "Final", "Finances", "Formation", "For Sale",
                    "Game", "Game deleted with success", "Goal", "Goals", "Gold", "Group",
                    "History", "Home",
                    "Income",
                    "League", "Load Game", "Loading game...",
                    "Market Value", "Match", "Matches",
                    "Name", "Nationality", "New Game",
                    "No",
                    "#Overall",
                    "Play", "Players", "Position", "Preferred Side", "Processing...",
                    "Quarter-finals",
                    "#Raffoot", "Ranking", "Rating", "Round of 16", "Round of 32", "Round of 64",
                    "Search", "Search Players", "Semifinals", "Silver", "Squad", "Start Game", "Stadium", "Star", "Starting game...", "Supercup",
                    "Ticket Price", "Top Scorers",
                    "Wage", "World",
                    "Year", "Yes"
                };

                var confederations = new[]
                {
                    "Argentina", "Brazil", "England", "France", "Germany", "Italy", "Portugal", "Spain",
                    "BeNe", "British Isles", "Central Europe", "Eastern Europe", "Eurasia", "Scandinavia", "North America", "South America", "Rest of the World",
                };
                texts.AddRange(confederations);

                texts.AddRange(confederations.Select(c => $"{c} League"));

                var countries = _context.Countries.OrderBy(c => c.Name);
                texts.AddRange(countries.Where(c => !texts.Contains(c.Name)).Select(c => c.Name));

                var service = new MicrosoftTranslator();

                var languages = new[] { "pt", "de", "es", "fr", "it", "nl", };

                var tasks = texts
                    .Select(t => !t.Contains(' ') ? string.Concat(PrefixOfContext, t) : t)
                    .Select(t => service.Translate(t, languages));

                var translationsResponses = await Task.WhenAll(tasks).ConfigureAwait(false);

                dynamic json = new ExpandoObject();

                foreach (var language in languages)
                {
                    dynamic languageProperty = new ExpandoObject();
                    (json as IDictionary<string, object>).Add(language, languageProperty);

                    var translations = translationsResponses.SelectMany(translationResponses => translationResponses.SelectMany(t => t.Translations)).Where(t => t.To == language).ToList();

                    foreach (var translation in translations.OrderBy(t => t.OriginalText))
                    {
                        var originalText = translation.OriginalText.Replace(PrefixOfContext, string.Empty).TrimStart('#');
                        var translatedText = (translation.OriginalText.StartsWith(PrefixOfContext) ? translation.Text[(translation.Text.IndexOf("- ") + 2)..] : translation.Text).TrimStart('#');

                        (languageProperty as IDictionary<string, object>).Add(originalText, translatedText);
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

                foreach (var club in clubs)
                {
                    var mainKitPath = @$"{_imagesFolder}\kits\{club.ExternalId}\1.png";

                    if (File.Exists(mainKitPath))
                    {
                        using var originalBitmap = BitmapService.ConvertToBitmap(mainKitPath);
                        var rectangle = CropRectangle(new Rectangle(0, 0, originalBitmap.Width, originalBitmap.Height), 0.65m, 0.25m);
                        using var bitmap = BitmapService.Crop(originalBitmap, rectangle);
                        var backColor = BitmapService.GetAverageColor(bitmap);
                        var foreColor = BitmapService.PerceivedBrightness(backColor) > 130 ? Color.Black : Color.White;

                        sb.AppendLine(string.Format("\t\tContext.game.clubs.find(c => c.name === \"{0}\" && c.country.name === \"{1}\").setColors('{2}', '{3}');",
                            club.Name,
                            leagues.Single(l => l.ExternalId == club.LeagueId).Country,
                            $"rgb({backColor.R},{backColor.G},{backColor.B})",
                            foreColor.Name.ToLower()));

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
