namespace RaffootLoader.Domain.Models
{
    public class Translation
    {
        public int Id { get; set; }

        public string OriginalText { get; set; }

        public string TranslatedText { get; set; }

        public string Language { get; set; }

        public Translation(string originalText, string translatedText, string language)
        {
            OriginalText = originalText;
            TranslatedText = translatedText;
            Language = language;
        }
    }
}
