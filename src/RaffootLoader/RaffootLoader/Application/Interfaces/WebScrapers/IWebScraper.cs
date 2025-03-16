namespace RaffootLoader.Application.Interfaces.WebScrapers
{
    public interface IWebScraper
    {
        Task<string> GetHtmlDocument(string url);
    }
}
