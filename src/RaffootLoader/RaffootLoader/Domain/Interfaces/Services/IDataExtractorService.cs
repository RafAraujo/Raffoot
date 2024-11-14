using HtmlAgilityPack;
using RaffootLoader.Services.DTO;
using RaffootLoader.Utils;
using System.Net;

namespace RaffootLoader.Domain.Interfaces.Services
{
    public interface IDataExtractorService
    {
        Task<DatabaseDto> GetDatabase();
	}
}