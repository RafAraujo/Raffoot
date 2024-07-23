using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Integration;
using RaffootLoader.Services.Interfaces;
using RaffootLoader.Utils;

namespace RaffootLoader.Services
{
	public class TranslatorService(IContext context, ITranslatorApi translatorApi) : ITranslatorService
	{
		private readonly IContext _context = context;
		private readonly ITranslatorApi _translatorApi = translatorApi;

		private readonly string[] _positions =
		[
			"Goalkeeper", "centre-back",  $"{PrefixOfContext}{Separator}Left-back",  $"{PrefixOfContext}{Separator}Right-back", "Left wing-back", "Right wing-back",
			"Defensive midfielder", "Left midfielder", $"{PrefixOfContext}{Separator}Centre midfielder", "Right midfielder", "Attacking midfielder",
			$"{PrefixOfContext}{Separator}Left winger", $"{PrefixOfContext}{Separator}Right winger", "Centre forward", "Striker"
		];

		private readonly string[] _continents = ["Africa", "Asia", "America", "Europe"];

		private readonly string[] _confederations =
		[
			"Argentina", "Brazil", "Australia", "Saudi Arabia", "England", "France", "Germany", "Italy", "Portugal", "Spain",
			"BeNe", "British Isles", "Centre Europe", "Eastern Europe", "Eurasia", "Indochina", "Korea-Japan", "North America", "Scandinavia", "South America",
		];

		private readonly string[] _texts =
		[
			"Advance", "Age", "Assists", "Attack", "Audience", "Automatic selection", $"{PrefixOfContext}{Separator}Away", "Average",
			"Back", "Background color", $"{PrefixOfContext}{Separator}Balanced", "Ball Possession", $"{PrefixOfContext}{Separator}Board of Directors", "Bronze",
			"Calendar", "Cancel", "Capacity", "Category", "Champions", "Championship", "Championships", "Choose your club", "Clear", "Classification", "Close", "Club", "Clubs", "Coach", "Colors", "CON", "Continental Supercup", "Continue", "Country", "Creating game...", $"{PrefixOfContext}{Separator}Cup",
			"Date", "Defense", $"{PrefixOfContext}{Separator}Defensive", "Delete", "Diamond", "Division", $"{PrefixOfContext}{Separator}Draws",
			"End of contract", "End of the match", "Energy", "Error", "Event", "Exit Game", "Expand",
			"False 9", "Final", "Finances", "Flat", "Formation", "For Sale", "Foul", "Fouls", "Free Kick Taker", "Full screen",
			"Game", "Game deleted with success",  $"{PrefixOfContext}{Separator}Goal",  $"{PrefixOfContext}{Separator}Goals", $"{PrefixOfContext}{Separator}Goals against", $"{PrefixOfContext}{Separator}Goals difference", "Gold", "Group",
			"History", "Holding", $"{PrefixOfContext}{Separator}Home",
			"Income", "Injured player", "International",
			"League", "Left", $"{PrefixOfContext}{Separator}Lineup", "Load", "Load Game", "Load more", "Loading game...", "Logo", $"{PrefixOfContext}{Separator}Losses",
			"Market Value", $"{PrefixOfContext}{Separator}Match", "Matchday", "Matches", $"{PrefixOfContext}{Separator}Maximum", "Midfield", $"{PrefixOfContext}{Separator}Minimum", "Money",
			"Name", "Narrow", "National", "Nationality", "New Game", "No",
			$"{PrefixOfContext}{Separator}Offensive", "Offside", "Options", "Out until {0}", "Overall", "OV",
			$"{PrefixOfContext}{Separator}Passes", $"{PrefixOfContext}{Separator}Penalty", "Penalty Taker", "Play", $"{PrefixOfContext}{Separator}Player", $"{PrefixOfContext}{Separator}Players", "Playing Style", $"{PrefixOfContext}{Separator}Points", "Position", "POS", "Preferred Side", "Processing...",
			"Quarter-finals",
			"Raffoot", "Ranking", "Red Card", $"{PrefixOfContext}{Separator}Referee", "Reset", $"{PrefixOfContext}{Separator}Right", "Round of 16", "Round of 32", "Round of 64",
			"Save Changes", "Save Game", "Search", "Search Players", "Sector", "Semifinals", "Shots on goal", "Showing {0} of {1}", "Silver", "Squad", "Stadium", "Standings", "Star", "Start Game", "Starting game...", "Start of the match", "Statistics", "Supercup", $"{PrefixOfContext}{Separator}Supporters",  $"{PrefixOfContext}{Separator}Suspended",
			$"{PrefixOfContext}{Separator}Tackles", "Text color", "Ticket Price", "Time", "Top Scorers", "Total", "Transfer Window", $"{PrefixOfContext}{Separator}Trust", "Type",
			"Uniform",
			$"{PrefixOfContext}{Separator}Wage", "Wide", "Window mode", "Wins", "World", "World Cup",
			"Year", "Yellow Card", "Yellow Cards", "Yes"
		];

		private readonly string[] _fixedTexts = ["BeNe", "CON", "Overall", "OV", "Raffoot", "Reset"];

		// https://www.reddit.com/r/EASportsFC/comments/aq78a6/currently_working_on_a_project_and_need_to_find/
		private readonly Translation[] _fixedTranslations =
		[
			new("GK", "G", "fr"),    new("GK", "POR", "es"),  new("GK", "TW", "de"),   new("GK", "GR", "pt-PT"),   new("GK", "GOL", "pt-BR"),  new("GK", "POR", "it"),  new("GK", "DM", "nl"),   new("GK", "BR", "pl"),   new("GK", "BR", "cs"),
			new("RB", "DD", "fr"),   new("RB", "LD", "es"),   new("RB", "RV", "de"),   new("RB", "DD", "pt-PT"),   new("RB", "LD", "pt-BR"),   new("RB", "TD", "it"),   new("RB", "RA", "nl"),   new("RB", "PO", "pl"),   new("RB", "PO", "cs"),
			new("RWB", "DLD", "fr"), new("RWB", "CAD", "es"), new("RWB", "RAV", "de"), new("RWB", "LDO", "pt-PT"), new("RWB", "ADD", "pt-BR"), new("RWB", "ADA", "it"), new("RWB", "RVV", "nl"), new("RWB", "CPS", "pl"), new("RWB", "PKO", "cs"),
			new("CB", "DC", "fr"),   new("CB", "DFC", "es"),  new("CB", "IV", "de"),   new("CB", "DC", "pt-PT"),   new("CB", "ZAG", "pt-BR"),  new("CB", "DC", "it"),   new("CB", "CV", "nl"),   new("CB", "SO", "pl"),   new("CB", "SO", "cs"),
			new("LB", "DG", "fr"),   new("LB", "LI", "es"),   new("LB", "LV", "de"),   new("LB", "DE", "pt-PT"),   new("LB", "LE", "pt-BR"),   new("LB", "TS", "it"),   new("LB", "LA", "nl"),   new("LB", "LO", "pl"),   new("LB", "LO", "cs"),
			new("LWB", "DLG", "fr"), new("LWB", "CAI", "es"), new("LWB", "LAV", "de"), new("LWB", "LEO", "pt-PT"), new("LWB", "ADE", "pt-BR"), new("LWB", "ASA", "it"), new("LWB", "LVV", "nl"), new("LWB", "CLS", "pl"), new("LWB", "LKO", "cs"),
			new("CDM", "MDC", "fr"), new("CDM", "MCD", "es"), new("CDM", "ZDM", "de"), new("CDM", "MDC", "pt-PT"), new("CDM", "VOL", "pt-BR"), new("CDM", "CDC", "it"), new("CDM", "CVM", "nl"), new("CDM", "SPD", "pl"), new("CDM", "SDZ", "cs"),
			new("CM", "MC", "fr"),   new("CM", "MC", "es"),   new("CM", "ZM", "de"),   new("CM", "MC", "pt-PT"),   new("CM", "MC", "pt-BR"),   new("CM", "CC", "it"),   new("CM", "CM", "nl"),   new("CM", "SP", "pl"),   new("CM", "SZ", "cs"),
			new("CAM", "MOC", "fr"), new("CAM", "MCO", "es"), new("CAM", "ZOM", "de"), new("CAM", "MCO", "pt-PT"), new("CAM", "MEI", "pt-BR"), new("CAM", "COC", "it"), new("CAM", "CAM", "nl"), new("CAM", "SPO", "pl"), new("CAM", "SOZ", "cs"),
			new("RM", "MD", "fr"),   new("RM", "MD", "es"),   new("RM", "RM", "de"),   new("RM", "MD", "pt-PT"),   new("RM", "MD", "pt-BR"),   new("RM", "ED", "it"),   new("RM", "RM", "nl"),   new("RM", "PP", "pl"),   new("RM", "PZ", "cs"),
			new("RW", "AD", "fr"),   new("RW", "ED", "es"),   new("RW", "RF", "de"),   new("RW", "ED", "pt-PT"),   new("RW", "PD", "pt-BR"),   new("RW", "AD", "it"),   new("RW", "RVA", "nl"),  new("RW", "PS", "pl"),   new("RW", "PK", "cs"),
			new("LM", "MG", "fr"),   new("LM", "MI", "es"),   new("LM", "LM", "de"),   new("LM", "ME", "pt-PT"),   new("LM", "ME", "pt-BR"),   new("LM", "ES", "it"),   new("LM", "LM", "nl"),   new("LM", "LP", "pl"),   new("LM", "LZ", "cs"),
			new("LW", "AG", "fr"),   new("LW", "EI", "es"),   new("LW", "LF", "de"),   new("LW", "EE", "pt-PT"),   new("LW", "PE", "pt-BR"),   new("LW", "AS", "it"),   new("LW", "LVA", "nl"),  new("LW", "LS", "pl"),   new("LW", "LK", "cs"),
			new("RF", "AVD", "fr"),  new("RF", "SDD", "es"),  new("RF", "RS", "de"),   new("RF", "AD", "pt-PT"),   new("RF", "MAD", "pt-BR"),  new("RF", "ATD", "it"),  new("RF", "RV", "nl"),   new("RF", "PN", "pl"),   new("RF", "PU", "cs"),
			new("CF", "AT", "fr"),   new("CF", "SD", "es"),   new("CF", "MS", "de"),   new("CF", "AC", "pt-PT"),   new("CF", "SA", "pt-BR"),   new("CF", "AT", "it"),   new("CF", "CA", "nl"),   new("CF", "SN", "pl"),   new("CF", "SU", "cs"),
			new("LF", "AVG", "fr"),  new("LF", "SDI", "es"),  new("LF", "LS", "de"),   new("LF", "AE", "pt-PT"),   new("LF", "MAE", "pt-BR"),  new("LF", "ATS", "it"),  new("LF", "LV", "nl"),   new("LF", "LN", "pl"),   new("LF", "LU", "cs"),
			new("ST", "BU", "fr"),   new("ST", "DC", "es"),   new("ST", "ST", "de"),   new("ST", "PL", "pt-PT"),   new("ST", "ATA", "pt-BR"),  new("ST", "ATT", "it"),  new("ST", "SP", "nl"),   new("ST", "N", "pl"),    new("ST", "HU", "cs"),

			new("Left wing-back", "Ala-esquerdo", "pt-BR"),
			new("Right wing-back", "Ala-direito", "pt-BR"),
			new("Left midfielder", "Meia-esquerda", "pt-BR"),
			new("Right midfielder", "Meia-direita", "pt-BR"),
			new("Left winger", "Ponta-esquerda", "pt-BR"),
			new("Right winger", "Ponta-direita", "pt-BR"),

			new("Goals difference", "Saldo de gols", "pt-BR"),
			new("Matchday", "Rodada", "pt-BR"),
			new("Standings", "Tabelas", "pt-BR"),
			new("Squad", "Elenco", "pt-BR"),
			new("Tackles", "Desarmes", "pt-BR"),
		];

		private const string PrefixOfContext = "Men's Football";
		private const string Separator = " - ";

		public async Task UpdateTranslations()
		{
			var translations = new List<Translation>();

			try
			{
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
						translations.Add(new(originalText, translatedText, translation.Language));
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

		private List<string> GetTextsToTranslate()
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
