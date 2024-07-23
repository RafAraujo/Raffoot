using RaffootLoader.Data;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Interfaces;
using RaffootLoader.Utils;
using System.Dynamic;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;

namespace RaffootLoader.Services
{
	public class MultiLanguageFileGenerator(ISettings settings, IContext context) : IMultiLanguageFileGenerator
	{
		private readonly ISettings _settings = settings;
		private readonly IContext _context = context;

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

				var serialized = JsonSerializer.Serialize(json, new JsonSerializerOptions { WriteIndented = true, Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping });

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
	}
}
