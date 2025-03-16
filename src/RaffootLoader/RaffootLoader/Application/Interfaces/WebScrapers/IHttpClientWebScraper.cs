namespace RaffootLoader.Application.Interfaces.WebScrapers
{
    public interface IHttpClientWebScraper : IWebScraper
    {
        void Dispose();
        void SetCookies(string baseUrl, string cookies);
    }
}
