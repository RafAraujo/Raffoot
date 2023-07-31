using Newtonsoft.Json;
using RaffootLoader.API.MicrosoftTranslator.DTO.Response;
using RaffootLoader.Domain.Models;
using System.Text;

namespace RaffootLoader.API.MicrosoftTranslator
{
    public class MicrosoftTranslator : ITranslatorApi
    {
        private static readonly string key = "4d5183c04ef24fe1b77ad188441bc451";
        private static readonly string endpoint = "https://api.cognitive.microsofttranslator.com";

        private readonly HttpClient _client;

        public MicrosoftTranslator(HttpClient client)
        {
            _client = client;
        }

        public async Task<IEnumerable<Translation>> Translate(IEnumerable<string> texts, IEnumerable<string> targetLanguages, string sourceLanguage)
        {
            var languages = string.Join("&to=", targetLanguages);

            var route = $"/translate?api-version=3.0&from={sourceLanguage}&to={languages}";
            var body = texts.Select(t => new { Text = t });
            var requestBody = JsonConvert.SerializeObject(body);

            using var request = new HttpRequestMessage();
            request.Method = HttpMethod.Post;
            request.RequestUri = new Uri(endpoint + route);
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");
            request.Headers.Add("Ocp-Apim-Subscription-Key", key);

            var response = await _client.SendAsync(request).ConfigureAwait(false);
            var content = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                var responseSerialized = JsonConvert.DeserializeObject<IEnumerable<MicrosoftTranslatorResponseDTO>>(content);
                var result = responseSerialized.SelectMany(r => r.Translations).Select(t => new Translation(t.OriginalText, t.Text, t.To));
                return result;
            }
            else
            {
                throw new Exception(content);
            }
        }
    }
}