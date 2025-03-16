using PuppeteerSharp;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Infrastructure.CrossCutting.Utils;

namespace RaffootLoader.Infrastructure.WebScrapers
{
    public class PuppeteerWebScraper : IPuppeteerWebScraper, IAsyncDisposable
    {
        private IBrowser _browser;
        private static readonly ResourceType[] _resources = [ResourceType.Document, ResourceType.Image];

        public async Task<string> GetHtmlDocument(string url)
        {
            try
            {
                var browser = await GetBrowser().ConfigureAwait(false);
                using var page = await browser.NewPageAsync().ConfigureAwait(false);
                await page.SetUserAgentAsync("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36");
                await page.SetRequestInterceptionAsync(true).ConfigureAwait(false);
                page.Request += async (sender, e) =>
                {
                    if (_resources.Contains(e.Request.ResourceType))
                    {
                        await e.Request.ContinueAsync().ConfigureAwait(false);
                    }
                    else
                    {
                        await e.Request.AbortAsync().ConfigureAwait(false);
                    }
                };
                await page.GoToAsync(url).ConfigureAwait(false);
                var html = await page.GetContentAsync().ConfigureAwait(false);
                return html;
            }
            catch (HttpRequestException ex)
            {
                ConsoleUtils.ShowException(ex);
                throw;
            }
        }

        private async Task<IBrowser> GetBrowser()
        {
            _browser ??= await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Browser = SupportedBrowser.Chrome,
                Headless = true,
            }).ConfigureAwait(false);
            return _browser;
        }

        public async ValueTask DisposeAsync()
        {
            if (_browser != null)
            {
                await _browser.CloseAsync().ConfigureAwait(false);
                _browser = null;
            }

            GC.SuppressFinalize(this);
        }
    }
}
