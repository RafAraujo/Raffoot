using RaffootLoader.Domain.Models;
using RaffootLoader.Services.DTO;

namespace RaffootLoader.Domain.Interfaces.Services
{
	public interface IImageService
	{
		ImageInfoDto GetFlag(Country country);
		ImageInfoDto GetLogo(Club club);
		IEnumerable<ImageInfoDto> GetKits(Club club);
		ImageInfoDto GetPhoto(Player player);
	}
}