using Newtonsoft.Json;

namespace RaffootLoader.DTO.Response
{
    public class MicrosoftTranslatorResponseDTO
    {

        [JsonProperty("translations")]
        public List<TranslationDTO> Translations { get; set; }
    }

    public class TranslationDTO
    {
        public string OriginalText { get; set; }

        [JsonProperty("text")]
        public string Text { get; set; }

        [JsonProperty("to")]
        public string To { get; set; }
    }

}
