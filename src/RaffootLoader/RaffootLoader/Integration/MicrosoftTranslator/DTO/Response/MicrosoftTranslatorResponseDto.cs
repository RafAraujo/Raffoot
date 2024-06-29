using System.Text.Json.Serialization;

namespace RaffootLoader.Integration.MicrosoftTranslator.DTO.Response
{
	public class MicrosoftTranslatorResponseDto
	{

		[JsonPropertyName("translations")]
		public List<MicrosoftTranslationDTO> Translations { get; set; }
	}

	public class MicrosoftTranslationDTO
	{
		public string OriginalText { get; set; }

		[JsonPropertyName("text")]
		public string Text { get; set; }

		[JsonPropertyName("to")]
		public string To { get; set; }
	}

}
