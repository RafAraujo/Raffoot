using RaffootLoader.Application.DTO;

namespace RaffootLoader.Application.Interfaces.Services.DataExtractors
{
	public interface IDataExtractorService
	{
		Task<DatabaseDto> GetDatabaseDto();
	}
}