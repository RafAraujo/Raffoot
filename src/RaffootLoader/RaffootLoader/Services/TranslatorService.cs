using RaffootLoader.API;
using RaffootLoader.API.MicrosoftTranslator;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Interfaces;
using RaffootLoader.Utils;

namespace RaffootLoader.Services
{
    public class TranslatorService : ITranslatorService
    {
        private readonly IContext _context;
        private readonly string _basePath;
        private readonly ITranslatorApi _translatorApi;

        private readonly string[] _texts = new[]
        {
            "Age", "Assists", "Audience", "Away",
            "Back", "Ball Possession", "Board of Directors", "Bronze",
            "Calendar", "Cancel", "Capacity", "Category", "Champions", "Classification Tables", "Club", "Clubs", "Choose your club", "Coach", "Contract", "Country", "Creating game...", "Cup",
            "Date", "Delete", "Division",
            "End of Contract", "Energy", "Error", "Expand",
            "Final", "Finances", "Formation", "For Sale", "Free kick", "Free kick taker",
            "Game", "Game deleted with success", "Goal", "Goals", "Gold", "Group",
            "History", "Home",
            "Income",
            "League", "Load Game", "Loading game...",
            "Market Value", "Matches",
            "Name", "Nationality", "New Game",
            "No",
            "Offside", "Overall",
            "Penalty", "penalty taker", "Play", "Players", "Position", "Preferred Side", "Processing...",
            "Quarter-finals",
            "Raffoot", "Ranking", "Referee", "Renew contract", "Round of 16", "Round of 32", "Round of 64",
            "Save Game", "Search", "Search Players", "Semifinals", "Silver", "Squad", "Stadium", "Start Game", "Star", "Starting game...", "Statistics", "Supercup",
            "Ticket Price", "Top Scorers", "Trust",
            "Wage", "World",
            "Year", "Yes"
        };
        private readonly string[] _fixedTexts = new[] { "BeNe", "Overall", "Raffoot" };

        private const string PrefixOfContext = "Football";
        private const string Separator = " - ";

        public TranslatorService(IContext context, string basePath)
        {
            _context = context;
            _basePath = basePath;
            _translatorApi = new GoogleTranslator(new HttpClient());
        }

        public async Task UpdateTranslations()
        {
            var translations = new List<Translation>();

            try
            {
                const string FileName = "MultiLanguage";
                var filePath = Path.Combine(_basePath, "Raffoot.Domain", $"{FileName}.js");

                const string sourceLanguage = "en";

                var languages = new[] { "pt" };

                var dbTranslations = _context.Translations.Select(t => t.OriginalText);
                var originalTexts = GetTextsToTranslate();
                var textsToTranslate = originalTexts.Where(t => !dbTranslations.Contains(t));
                var textsToTranslateAgain = new List<string>();
                var fixedTexts = textsToTranslate.Where(t => _fixedTexts.Contains(t));

                if (fixedTexts.Any())
                {
                    foreach (var language in languages)
                    {
                        translations.AddRange(fixedTexts.Select(t => new Translation(t, t, language)));
                    }
                    textsToTranslate = textsToTranslate.Where(t => !fixedTexts.Contains(t));
                }

                var responseWithPrefix = await _translatorApi.Translate(textsToTranslate.Select(GetTextWithPrefix), languages, sourceLanguage).ConfigureAwait(false);

                foreach (var translationWithPrefix in responseWithPrefix)
                {
                    if (translationWithPrefix.TranslatedText.Contains(Separator))
                    {
                        var originalText = GetTextWithoutPrefix(translationWithPrefix.OriginalText).WithFirstCharUppercase();
                        var translatedText = translationWithPrefix.TranslatedText[(translationWithPrefix.TranslatedText.IndexOf(Separator) + Separator.Length)..].WithFirstCharUppercase();
                        translations.Add(new Translation(originalText, translatedText, translationWithPrefix.Language));
                    }
                }

                textsToTranslate = responseWithPrefix.Where(t => !t.TranslatedText.Contains(Separator)).Select(t => GetTextWithoutPrefix(t.OriginalText));
                var response = await _translatorApi.Translate(textsToTranslate, languages, sourceLanguage).ConfigureAwait(false);

                foreach (var translation in response)
                {
                    translation.OriginalText = translation.OriginalText.WithFirstCharUppercase();
                    translation.TranslatedText = translation.TranslatedText.WithFirstCharUppercase();
                    translations.Add(translation);
                }

                _context.InsertMany(translations);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
        }

        private static string GetTextWithPrefix(string text) => $"{PrefixOfContext}{Separator}{text}";

        private static string GetTextWithoutPrefix(string text) => text.Replace($"{PrefixOfContext}{Separator}", string.Empty);

        private IEnumerable<string> GetTextsToTranslate()
        {
            var texts = _texts.ToList();

            var confederations = new[]
            {
                "Argentina", "Brazil", "England", "France", "Germany", "Italy", "Portugal", "Spain",
                "BeNe", "British Isles", "Central Europe", "Eastern Europe", "Eurasia", "Scandinavia", "North America", "South America", "Rest of the World",
            };

            texts.AddRange(confederations);
            texts.AddRange(confederations.Select(c => $"{c} League"));

            var countries = _context.Countries.OrderBy(c => c.Name);
            texts.AddRange(countries.Where(c => !texts.Contains(c.Name)).Select(c => c.Name));

            return texts;
        }
    }
}
