using RaffootLoader.Services.DTO;

namespace RaffootLoader.Domain.Interfaces.Services
{
	public interface IDataExtractorService
	{
		Task<DatabaseDto> GetDatabaseDto();
	}
}