using Microsoft.Playwright;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Infrastructure.CrossCutting.Utils;

namespace RaffootLoader.Infrastructure.WebScrapers
{
    public class PlaywrightWebScraper : IPlaywrightWebScraper, IDisposable
    {
        private IPlaywright _playwright;
        private static readonly string[] _resources = ["document", "image"];

        public async Task<string> GetHtmlDocument(string url)
        {
            try
            {
                var playwright = await GetPlaywright().ConfigureAwait(false);
                await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true }).ConfigureAwait(false);
                var page = await browser.NewPageAsync(new BrowserNewPageOptions
                {
                    UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
                }).ConfigureAwait(false);
                await page.RouteAsync("**/*", route =>
                {
                    if (_resources.Contains(route.Request.ResourceType))
                    {
                        route.ContinueAsync();
                    }
                    else
                    {
                        route.AbortAsync();
                    }
                });
                await page.GotoAsync(url).ConfigureAwait(false);
                var html = await page.ContentAsync().ConfigureAwait(false);
                return html;
            }
            catch (HttpRequestException ex)
            {
                ConsoleUtils.ShowException(ex);
                throw;
            }
        }

        private async Task<IPlaywright> GetPlaywright()
        {
            _playwright ??= await Playwright.CreateAsync().ConfigureAwait(false);
            return _playwright;
        }

        public void Dispose()
        {
            if (_playwright != null)
            {
                _playwright.Dispose();
                _playwright = null;
            }

            GC.SuppressFinalize(this);
        }
    }
}
