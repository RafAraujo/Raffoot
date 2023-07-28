using Newtonsoft.Json;
using RaffootLoader.DTO.Response;
using RaffootLoader.Utils;
using System.Text;

namespace RaffootLoader.Services
{
    public class MicrosoftTranslator
    {
        private static readonly string key = "4d5183c04ef24fe1b77ad188441bc451";
        private static readonly string endpoint = "https://api.cognitive.microsofttranslator.com";

        private readonly HttpClient _client;

        public MicrosoftTranslator()
        {
            _client = new();
        }

        public async Task<List<MicrosoftTranslatorResponseDTO>> Translate(string text, IEnumerable<string> targetLanguages, string sourceLanguage = "en")
        {
            List<MicrosoftTranslatorResponseDTO> result = null;

            try
            {
                var languages = string.Join("&to=", targetLanguages);

                var route = $"/translate?api-version=3.0&from={sourceLanguage}&to={languages}";
                object[] body = new object[] { new { Text = text } };
                var requestBody = JsonConvert.SerializeObject(body);

                using var request = new HttpRequestMessage();
                request.Method = HttpMethod.Post;
                request.RequestUri = new Uri(endpoint + route);
                request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                request.Headers.Add("Ocp-Apim-Subscription-Key", key);

                var response = await _client.SendAsync(request).ConfigureAwait(false);
                var content = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                result = JsonConvert.DeserializeObject<List<MicrosoftTranslatorResponseDTO>>(content);

                foreach (var translation in result.SelectMany(t => t.Translations))
                {
                    translation.OriginalText = text;
                }
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }

            return result;
        }
    }
}
