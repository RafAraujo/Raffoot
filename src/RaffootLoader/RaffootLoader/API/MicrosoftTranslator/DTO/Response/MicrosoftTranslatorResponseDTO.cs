using Newtonsoft.Json;

namespace RaffootLoader.API.MicrosoftTranslator.DTO.Response
{
    public class MicrosoftTranslatorResponseDTO
    {

        [JsonProperty("translations")]
        public List<MicrosoftTranslationDTO> Translations { get; set; }
    }

    public class MicrosoftTranslationDTO
    {
        public string OriginalText { get; set; }

        [JsonProperty("text")]
        public string Text { get; set; }

        [JsonProperty("to")]
        public string To { get; set; }
    }

}
