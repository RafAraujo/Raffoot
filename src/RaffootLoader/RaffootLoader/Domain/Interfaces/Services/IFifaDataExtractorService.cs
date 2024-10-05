using RaffootLoader.Services.DTO;

namespace RaffootLoader.Domain.Interfaces.Services
{
    public interface IFifaDataExtractorService
    {
        Task<FifaDatabaseDto> GetFifaDatabase();
    }
}