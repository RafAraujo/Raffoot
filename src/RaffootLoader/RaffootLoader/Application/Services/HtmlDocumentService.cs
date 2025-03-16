using HtmlAgilityPack;
using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Models;
using System.Web;

namespace RaffootLoader.Application.Services
{
    public class HtmlDocumentService(ISettings settings) : IHtmlDocumentService
    {
        public async Task<HtmlDocument> GetHtmlDocument(League league, string url, IWebScraper webScraper)
        {
            var filePath = Path.Combine(settings.HtmlFolder, "League", $"{league.Country} {league.Division}.html");
            return await GetHtmlDocument(filePath, url, webScraper).ConfigureAwait(false);
        }

        public async Task<HtmlDocument> GetHtmlDocument(Club club, string url, IWebScraper webScraper)
        {
            var filePath = Path.Combine(settings.HtmlFolder, "Club", club.Country, $"{club.GetFileName()}.html");
            return await GetHtmlDocument(filePath, url, webScraper).ConfigureAwait(false);
        }

        private static async Task<HtmlDocument> GetHtmlDocument(string filePath, string url, IWebScraper webScraper)
        {
            string html;

            if (!File.Exists(filePath))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(filePath));
                html = await webScraper.GetHtmlDocument(url).ConfigureAwait(false);
                File.WriteAllText(filePath, html);
            }

            html = File.ReadAllText(filePath);
            html = HttpUtility.HtmlDecode(html);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            return doc;
        }
    }
}
