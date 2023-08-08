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
        private readonly ISettingsManager _settings;
        private readonly IContext _context;
        private readonly ITranslatorApi _translatorApi;

        private readonly string[] _positions = new[]
        {
            "goalkeeper", "centre-back",  $"{PrefixOfContext}{Separator}left-back",  $"{PrefixOfContext}{Separator}right-back", "left wing-back", "right wing-back",
            "defensive midfielder", "left midfielder", "centre midfielder", "right midfielder", "attacking midfielder",
            $"{PrefixOfContext}{Separator}left winger", $"{PrefixOfContext}{Separator}right winger", "centre forward", "striker"
        };

        private readonly string[] _confederations = new[]
        {
            "Argentina", "Brazil", "England", "France", "Germany", "Italy", "Portugal", "Spain",
            "BeNe", "British Isles", "Central Europe", "Eastern Europe", "Eurasia", "Scandinavia", "North America", "South America", "Rest of the World",
        };

        private readonly string[] _texts = new[]
        {
            "age", "assists", "audience", $"{PrefixOfContext}{Separator}Away",
            "back", "ball possession", $"{PrefixOfContext}{Separator}board of directors", "bronze",
            "calendar", "cancel", "capacity", "category", "champions", "Champions Cup", "championship", "classification tables", "club", "clubs", "choose your club", "coach", "CON", "Conference Cup", "contract", "country", "creating game...", $"{PrefixOfContext}{Separator}Cup",
            "date", "delete", "division", $"{PrefixOfContext}{Separator}draws",
            "end of contract", "energy", "error", "expand",
            "final", "finances", "formation", "for sale", "free kick", "free kick taker",
            "game", "game deleted with success",  $"{PrefixOfContext}{Separator}goal",  $"{PrefixOfContext}{Separator}goals", "gold", "group",
            "history", $"{PrefixOfContext}{Separator}home",
            "income", "International Supercup",
            "league", "left", "load game", "loading game...", $"{PrefixOfContext}{Separator}losses",
            "market value", "matches",
            "name", "nationality", "new game", "no",
            "offside", "Overall", "OV",
            $"{PrefixOfContext}{Separator}penalty", "penalty taker", "play", $"{PrefixOfContext}{Separator}players", $"{PrefixOfContext}{Separator}points", "position", "POS", "preferred side", "processing...",
            "quarter-finals",
            "Raffoot", "ranking", $"{PrefixOfContext}{Separator}referee", "renew contract", $"{PrefixOfContext}{Separator}right", "round of 16", "round of 32", "round of 64",
            "save game", "search", "search players", "semifinals", "silver", "squad", "stadium", "star", "start game", "starting game...", "statistics", "supercup",
            "ticket price", "top scorers", $"{PrefixOfContext}{Separator}trust",
            $"{PrefixOfContext}{Separator}wage", "wins", "world",
            "year", "yes"
        };
        private readonly string[] _fixedTexts = new[] { "BeNe", "CON", "Overall", "OV", "Raffoot" };

        private readonly Translation[] _fixedTranslations = new[]
        {
            new Translation("GK", "G", "fr"),       new Translation("GK", "POR", "es"),     new Translation("GK", "TW", "de"),      new Translation("GK", "GR", "pt-PT"),       new Translation("GK", "GOL", "pt-BR"),      new Translation("GK", "POR", "it"),     new Translation("GK", "DM", "nl"),      new Translation("GK", "BR", "pl"),      new Translation("GK", "BR", "cs"),
            new Translation("RB", "DD", "fr"),      new Translation("RB", "LD", "es"),      new Translation("RB", "RV", "de"),      new Translation("RB", "DD", "pt-PT"),       new Translation("RB", "LD", "pt-BR"),       new Translation("RB", "TD", "it"),      new Translation("RB", "RA", "nl"),      new Translation("RB", "PO", "pl"),      new Translation("RB", "PO", "cs"),
            new Translation("RWB", "DLD", "fr"),    new Translation("RWB", "CAD", "es"),    new Translation("RWB", "RAV", "de"),    new Translation("RWB", "LDO", "pt-PT"),     new Translation("RWB", "ADD", "pt-BR"),     new Translation("RWB", "ADA", "it"),    new Translation("RWB", "RVV", "nl"),    new Translation("RWB", "CPS", "pl"),    new Translation("RWB", "PKO", "cs"),
            new Translation("CB", "DC", "fr"),      new Translation("CB", "DFC", "es"),     new Translation("CB", "IV", "de"),      new Translation("CB", "DC", "pt-PT"),       new Translation("CB", "ZAG", "pt-BR"),      new Translation("CB", "DC", "it"),      new Translation("CB", "CV", "nl"),      new Translation("CB", "SO", "pl"),      new Translation("CB", "SO", "cs"),
            new Translation("LB", "DG", "fr"),      new Translation("LB", "LI", "es"),      new Translation("LB", "LV", "de"),      new Translation("LB", "DE", "pt-PT"),       new Translation("LB", "LE", "pt-BR"),       new Translation("LB", "TS", "it"),      new Translation("LB", "LA", "nl"),      new Translation("LB", "LO", "pl"),      new Translation("LB", "LO", "cs"),
            new Translation("LWB", "DLG", "fr"),    new Translation("LWB", "CAI", "es"),    new Translation("LWB", "LAV", "de"),    new Translation("LWB", "LEO", "pt-PT"),     new Translation("LWB", "ADE", "pt-BR"),     new Translation("LWB", "ASA", "it"),    new Translation("LWB", "LVV", "nl"),    new Translation("LWB", "CLS", "pl"),    new Translation("LWB", "LKO", "cs"),
            new Translation("CDM", "MDC", "fr"),    new Translation("CDM", "MCD", "es"),    new Translation("CDM", "ZDM", "de"),    new Translation("CDM", "MDC", "pt-PT"),     new Translation("CDM", "VOL", "pt-BR"),     new Translation("CDM", "CDC", "it"),    new Translation("CDM", "CVM", "nl"),    new Translation("CDM", "SPD", "pl"),    new Translation("CDM", "SDZ", "cs"),
            new Translation("CM", "MC", "fr"),      new Translation("CM", "MC", "es"),      new Translation("CM", "ZM", "de"),      new Translation("CM", "MC", "pt-PT"),       new Translation("CM", "MC", "pt-BR"),       new Translation("CM", "CC", "it"),      new Translation("CM", "CM", "nl"),      new Translation("CM", "SP", "pl"),      new Translation("CM", "SZ", "cs"),
            new Translation("CAM", "MOC", "fr"),    new Translation("CAM", "MCO", "es"),    new Translation("CAM", "ZOM", "de"),    new Translation("CAM", "MCO", "pt-PT"),     new Translation("CAM", "MEI", "pt-BR"),     new Translation("CAM", "COC", "it"),    new Translation("CAM", "CAM", "nl"),    new Translation("CAM", "SPO", "pl"),    new Translation("CAM", "SOZ", "cs"),
            new Translation("RM", "MD", "fr"),      new Translation("RM", "MD", "es"),      new Translation("RM", "RM", "de"),      new Translation("RM", "MD", "pt-PT"),       new Translation("RM", "MD", "pt-BR"),       new Translation("RM", "ED", "it"),      new Translation("RM", "RM", "nl"),      new Translation("RM", "PP", "pl"),      new Translation("RM", "PZ", "cs"),
            new Translation("RW", "AD", "fr"),      new Translation("RW", "ED", "es"),      new Translation("RW", "RF", "de"),      new Translation("RW", "ED", "pt-PT"),       new Translation("RW", "PD", "pt-BR"),       new Translation("RW", "AD", "it"),      new Translation("RW", "RVA", "nl"),     new Translation("RW", "PS", "pl"),      new Translation("RW", "PK", "cs"),
            new Translation("LM", "MG", "fr"),      new Translation("LM", "MI", "es"),      new Translation("LM", "LM", "de"),      new Translation("LM", "ME", "pt-PT"),       new Translation("LM", "ME", "pt-BR"),       new Translation("LM", "ES", "it"),      new Translation("LM", "LM", "nl"),      new Translation("LM", "LP", "pl"),      new Translation("LM", "LZ", "cs"),
            new Translation("LW", "AG", "fr"),      new Translation("LW", "EI", "es"),      new Translation("LW", "LF", "de"),      new Translation("LW", "EE", "pt-PT"),       new Translation("LW", "PE", "pt-BR"),       new Translation("LW", "AS", "it"),      new Translation("LW", "LVA", "nl"),     new Translation("LW", "LS", "pl"),      new Translation("LW", "LK", "cs"),
            new Translation("RF", "AVD", "fr"),     new Translation("RF", "SDD", "es"),     new Translation("RF", "RS", "de"),      new Translation("RF", "AD", "pt-PT"),       new Translation("RF", "MAD", "pt-BR"),      new Translation("RF", "ATD", "it"),     new Translation("RF", "RV", "nl"),      new Translation("RF", "PN", "pl"),      new Translation("RF", "PU", "cs"),
            new Translation("CF", "AT", "fr"),      new Translation("CF", "SD", "es"),      new Translation("CF", "MS", "de"),      new Translation("CF", "AC", "pt-PT"),       new Translation("CF", "SA", "pt-BR"),       new Translation("CF", "AT", "it"),      new Translation("CF", "CA", "nl"),      new Translation("CF", "SN", "pl"),      new Translation("CF", "SU", "cs"),
            new Translation("LF", "AVG", "fr"),     new Translation("LF", "SDI", "es"),     new Translation("LF", "LS", "de"),      new Translation("LF", "AE", "pt-PT"),       new Translation("LF", "MAE", "pt-BR"),      new Translation("LF", "ATS", "it"),     new Translation("LF", "LV", "nl"),      new Translation("LF", "LN", "pl"),      new Translation("LF", "LU", "cs"),
            new Translation("ST", "BU", "fr"),      new Translation("ST", "DC", "es"),      new Translation("ST", "ST", "de"),      new Translation("ST", "PL", "pt-PT"),       new Translation("ST", "ATA", "pt-BR"),      new Translation("ST", "ATT", "it"),     new Translation("ST", "SP", "nl"),      new Translation("ST", "N", "pl"),       new Translation("ST", "HU", "cs"),
        };

        private const string PrefixOfContext = "football";
        private const string Separator = " - ";

        public TranslatorService(ISettingsManager settings, IContext context)
        {
            _settings = settings;
            _context = context;
            _translatorApi = new GoogleTranslator(new HttpClient());
        }

        public async Task UpdateTranslations()
        {
            var translations = new List<Translation>();

            try
            {
                const string FileName = "MultiLanguage";
                var filePath = Path.Combine(_settings.BasePath, "Raffoot.Domain", $"{FileName}.js");

                const string sourceLanguage = "en";

                var languages = new[] { "pt-BR" };

                var dbTranslations = _context.Translations.Select(t => t.OriginalText);
                translations = _fixedTranslations.Where(t => !dbTranslations.Select(dbT => dbT.ToLower()).Contains(t.OriginalText.ToLower())).ToList();

                var originalTexts = GetTextsToTranslate();
                var textsToTranslate = originalTexts.Where(t => !dbTranslations.Select(dbT => dbT.ToLower()).Contains(GetTextWithoutPrefix(t.ToLower()))).ToList();
                var fixedTexts = textsToTranslate.Where(t => _fixedTexts.Contains(t));

                if (fixedTexts.Any())
                {
                    foreach (var language in languages)
                    {
                        translations.AddRange(fixedTexts.Select(t => new Translation(t, t, language)));
                    }
                    textsToTranslate = textsToTranslate.Where(t => !fixedTexts.Contains(t)).ToList();
                }

                var response = await _translatorApi.Translate(textsToTranslate, languages, sourceLanguage).ConfigureAwait(false);

                foreach (var translation in response)
                {
                    var originalText = GetTextWithoutPrefix(translation.OriginalText).WithFirstCharUppercase();
                    var translatedText = (translation.TranslatedText.Contains(Separator) ? translation.TranslatedText[(translation.TranslatedText.IndexOf(Separator) + Separator.Length)..] : translation.TranslatedText).WithFirstCharUppercase();
                    translations.Add(new Translation(originalText, translatedText, translation.Language));
                }

                _context.InsertMany(translations);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
        }

        private static string GetTextWithoutPrefix(string text) => text.Replace($"{PrefixOfContext}{Separator}", string.Empty);

        private IEnumerable<string> GetTextsToTranslate()
        {
            var texts = _texts.ToList();

            texts.AddRange(_positions);
            texts.AddRange(_confederations);
            texts.AddRange(_confederations.Select(c => $"{c} League"));
            texts.AddRange(_confederations.Select(c => $"{c} Cup"));
            texts.AddRange(_confederations.Select(c => $"{c} Supercup"));

            var countries = _context.Countries.OrderBy(c => c.Name);
            texts.AddRange(countries.Where(c => !texts.Contains(c.Name)).Select(c => $"{PrefixOfContext}{Separator}{c.Name}"));

            return texts;
        }
    }
}
