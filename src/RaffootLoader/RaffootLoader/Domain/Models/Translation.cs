namespace RaffootLoader.Domain.Models
{
    public class Translation(string originalText, string translatedText, string language) : Entity
    {
		public string OriginalText { get; set; } = originalText;
		public string TranslatedText { get; set; } = translatedText;
		public string Language { get; set; } = language;
	}
}
