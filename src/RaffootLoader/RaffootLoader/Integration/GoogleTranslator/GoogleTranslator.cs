using RaffootLoader.Domain.Models;

namespace RaffootLoader.Integration.GoogleTranslator
{
    // https://codepen.io/junior-abd-almaged/pen/gQEbRv
    public class GoogleTranslator(HttpClient client) : ITranslatorApi
    {
        private static readonly string endpoint = "https://translate.googleapis.com/translate_a/single?client=gtx";

        private readonly HttpClient _client = client;

		public async Task<IEnumerable<Translation>> Translate(IEnumerable<string> texts, IEnumerable<string> targetLanguages, string sourceLanguage)
        {
            var tasks = new List<Task<Translation>>();

            foreach (var language in targetLanguages)
            {
                foreach (var text in texts)
                {
                    tasks.Add(Translate(text, language, sourceLanguage));
                }
            }

            var translations = await Task.WhenAll(tasks).ConfigureAwait(false);
            return translations;
        }


        private async Task<Translation> Translate(string text, string targetLanguage, string sourceLanguage)
        {
            var route = $"&sl={sourceLanguage}&tl={targetLanguage}&dt=t&q={text}";

            var response = await _client.GetAsync(endpoint + route).ConfigureAwait(false);
            var content = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                var result = content.Substring(4, content.IndexOf(',') - 5);
                var translation = new Translation(text, result, targetLanguage);
                return translation;
            }
            else
            {
                throw new Exception(content);
            }
        }
    }
}
