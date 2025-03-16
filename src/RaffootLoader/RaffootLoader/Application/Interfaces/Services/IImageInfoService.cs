using RaffootLoader.Application.DTO;
using RaffootLoader.Domain.Models;

namespace RaffootLoader.Application.Interfaces.Services
{
	public interface IImageInfoService
	{
		ImageInfoDto GetFlag(Country country);
		ImageInfoDto GetLogo(Club club);
		IEnumerable<ImageInfoDto> GetKits(Club club);
		ImageInfoDto GetPhoto(Player player);
	}
}