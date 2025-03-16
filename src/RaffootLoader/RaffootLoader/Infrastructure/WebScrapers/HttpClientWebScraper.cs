using HtmlAgilityPack;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Infrastructure.CrossCutting.Utils;
using System.Net;

namespace RaffootLoader.Infrastructure.WebScrapers
{
    public class HttpClientWebScraper : IHttpClientWebScraper, IDisposable
    {
        private HttpClient client = new();

        public async Task<string> GetHtmlDocument(string url)
        {
            HttpResponseMessage message;
            try
            {
                message = await client.GetAsync(url).ConfigureAwait(false);
                message.EnsureSuccessStatusCode();
                var html = await message.Content.ReadAsStringAsync().ConfigureAwait(false);
                return html;
            }
            catch (HttpRequestException ex)
            {
                ConsoleUtils.ShowException(ex);
                ConsoleUtils.WriteWarning("Waiting...");

                await Task.Delay(TimeSpan.FromSeconds(5)).ConfigureAwait(false);
                return await GetHtmlDocument(url).ConfigureAwait(false);
            }
        }

        public void SetCookies(string baseUrl, string cookies)
        {
            var cookieContainer = new CookieContainer();
            var handler = new HttpClientHandler
            {
                UseCookies = true,
                CookieContainer = cookieContainer,
            };

            var client = new HttpClient(handler)
            {
                BaseAddress = new Uri(baseUrl)
            };

            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36");
            client.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
            client.DefaultRequestHeaders.AcceptLanguage.ParseAdd("en-US,en;q=0.5");
            client.DefaultRequestHeaders.Connection.Add("keep-alive");
            client.DefaultRequestHeaders.Add("Upgrade-Insecure-Requests", "1");

            foreach (var cookie in cookies.Split(';', StringSplitOptions.RemoveEmptyEntries))
            {
                var parts = cookie.Split('=', 2, StringSplitOptions.TrimEntries);
                if (parts.Length == 2)
                {
                    var cookieName = parts[0];
                    var cookieValue = parts[1];
                    cookieContainer.Add(new Uri(baseUrl), new Cookie(cookieName, cookieValue));
                }
            }

            this.client = client;
        }

        public void Dispose()
        {
            if (client != null)
            {
                client.Dispose();
                client = null;
            }

            GC.SuppressFinalize(this);
        }
    }
}
