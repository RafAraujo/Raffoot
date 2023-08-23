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
        private readonly ISettings _settings;
        private readonly IContext _context;
        private readonly ITranslatorApi _translatorApi;

        private readonly string[] _positions = new[]
        {
            "Goalkeeper", "centre-back",  $"{PrefixOfContext}{Separator}Left-back",  $"{PrefixOfContext}{Separator}Right-back", "Left wing-back", "Right wing-back",
            "Defensive midfielder", "Left midfielder", $"{PrefixOfContext}{Separator}Centre midfielder", "Right midfielder", "Attacking midfielder",
            $"{PrefixOfContext}{Separator}Left winger", $"{PrefixOfContext}{Separator}Right winger", "Centre forward", "Striker"
        };

        private readonly string[] _continents = new[]
        
        {
            "Africa", "Asia", "America", "Europe"
        };

        private readonly string[] _confederations = new[]
        {
            "Argentina", "Brazil", "Australia", "Saudi Arabia", "England", "France", "Germany", "Italy", "Portugal", "Spain",
            "BeNe", "British Isles", "Centre Europe", "Eastern Europe", "Eurasia", "Indochina", "Korea-Japan", "North America", "Scandinavia", "South America",
        };

        private readonly string[] _texts = new[]
        {
            "Advance", "Age", "Assists", "Attack", "Audience", "Automatic selection", $"{PrefixOfContext}{Separator}Away", "Average",
            "Back", "Background color", $"{PrefixOfContext}{Separator}Balanced", "Ball Possession", $"{PrefixOfContext}{Separator}Board of Directors", "Bronze",
            "Calendar", "Cancel", "Capacity", "Category", "Champions", "Championship", "Championships", "Choose your club", "Clear", "Classification", "Close", "Club", "Clubs", "Coach", "Colors", "CON", "Continental Supercup", "Country", "Creating game...", $"{PrefixOfContext}{Separator}Cup",
            "Date", "Defense", $"{PrefixOfContext}{Separator}Defensive", "Delete", "Diamond", "Division", $"{PrefixOfContext}{Separator}Draws",
            "End of contract", "End of the match", "Energy", "Error", "Exit Game", "Expand",
            "False 9", "Final", "Finances", "Flat", "Formation", "For Sale", "Foul", "Free Kick Taker", "Full screen",
            "Game", "Game deleted with success",  $"{PrefixOfContext}{Separator}Goal",  $"{PrefixOfContext}{Separator}Goals", $"{PrefixOfContext}{Separator}Goals against", $"{PrefixOfContext}{Separator}goals difference", "Gold", "Group",
            "History", "Holding", $"{PrefixOfContext}{Separator}Home",
            "Income", "Injured player", "International",
            "League", "Left", $"{PrefixOfContext}{Separator}Lineup", "Load", "Load Game", "Load more", "Loading game...", "Logo", $"{PrefixOfContext}{Separator}Losses",
            "Market Value", "Matches", $"{PrefixOfContext}{Separator}Maximum", "Midfield", $"{PrefixOfContext}{Separator}Minimum", "Money",
            "Name", "Narrow", "National", "Nationality", "New Game", "No",
            $"{PrefixOfContext}{Separator}Offensive", "Offside", "Options", "Out until {0}", "Overall", "OV",
            $"{PrefixOfContext}{Separator}Passes", $"{PrefixOfContext}{Separator}Penalty", "Penalty Taker", "Play", $"{PrefixOfContext}{Separator}Player", $"{PrefixOfContext}{Separator}Players", "Playing Style", $"{PrefixOfContext}{Separator}Points", "Position", "POS", "Preferred Side", "Processing...",
            "Quarter-finals",
            "Raffoot", "Ranking", "Red Card", $"{PrefixOfContext}{Separator}Referee", "Reset", $"{PrefixOfContext}{Separator}Right", "Round of 16", "Round of 32", "Round of 64",
            "Save Changes", "Save Game", "Search", "Search Players", "Sector", "Semifinals", "Shots on goal", "Showing {0} of {1}", "Silver", "Squad", "Stadium", "Standings", "Star", "Start Game", "Starting game...", "Start of the match", "Statistics", "Supercup", $"{PrefixOfContext}{Separator}Supporters",  $"{PrefixOfContext}{Separator}Suspended",
            $"{PrefixOfContext}{Separator}Tackles", "Text color", "Ticket Price", "Time", "Top Scorers", "Total", $"{PrefixOfContext}{Separator}Trust", "Type",
            "Uniform",
            $"{PrefixOfContext}{Separator}Wage", "Wide", "Window mode", "Wins", "World", "World Cup",
            "Year", "Yellow Card", "Yellow Cards", "Yes"
        };
        private readonly string[] _fixedTexts = new[] { "BeNe", "CON", "Overall", "OV", "Raffoot", "Reset" };

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

            new Translation("Left wing-back", "Ala-esquerdo", "pt-BR"),
            new Translation("Right wing-back", "Ala-direito", "pt-BR"),
            new Translation("Left midfielder", "Meia-esquerda", "pt-BR"),
            new Translation("Right midfielder", "Meia-direita", "pt-BR"),
            new Translation("Left winger", "Ponta-esquerda", "pt-BR"),
            new Translation("Right winger", "Ponta-direita", "pt-BR"),

            new Translation("Standings", "Tabelas", "pt-BR"),
            new Translation("Squad", "Elenco", "pt-BR"),
            new Translation("Tackles", "Desarmes", "pt-BR"),
        };

        private const string PrefixOfContext = "Men's Football";
        private const string Separator = " - ";

        public TranslatorService(ISettings settings, IContext context)
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
                var textsToTranslate = originalTexts.Where(t => !dbTranslations.Select(dbT => dbT.ToLower()).Contains(GetTextWithoutPrefix(t).ToLower())).ToList();
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
                    var fixedTranslation = _fixedTranslations.SingleOrDefault(t => t.OriginalText == originalText && t.Language == translation.Language);

                    if (fixedTranslation == null)
                    {
                        var translatedText = (translation.TranslatedText.Contains(Separator) ? translation.TranslatedText[(translation.TranslatedText.IndexOf(Separator) + Separator.Length)..] : translation.TranslatedText).WithFirstCharUppercase();
                        translations.Add(new Translation(originalText, translatedText, translation.Language));
                    }
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
            texts.AddRange(_continents);
            texts.AddRange(_confederations);
            texts.AddRange(_confederations.Select(c => $"{PrefixOfContext}{Separator}{c} League"));
            texts.AddRange(_confederations.Select(c => $"{PrefixOfContext}{Separator}{c} Cup"));
            texts.AddRange(_confederations.Select(c => $"{PrefixOfContext}{Separator}{c} Supercup"));

            var countries = _context.Countries.OrderBy(c => c.Name);
            texts.AddRange(countries.Where(c => !texts.Contains(c.Name)).Select(c => $"{PrefixOfContext}{Separator}{c.Name}"));

            return texts;
        }
    }
}
