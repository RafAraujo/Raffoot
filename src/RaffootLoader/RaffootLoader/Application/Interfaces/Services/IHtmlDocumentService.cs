using HtmlAgilityPack;
using RaffootLoader.Application.Interfaces.WebScrapers;
using RaffootLoader.Domain.Models;

namespace RaffootLoader.Application.Interfaces.Services
{
    public interface IHtmlDocumentService
    {
        Task<HtmlDocument> GetHtmlDocument(League league, string url, IWebScraper webScraper);

        Task<HtmlDocument> GetHtmlDocument(Club club, string url, IWebScraper webScraper);
    }
}
