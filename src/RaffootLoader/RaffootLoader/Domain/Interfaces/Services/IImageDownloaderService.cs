using RaffootLoader.Domain.Enums;

namespace RaffootLoader.Domain.Interfaces.Services
{
	public interface IImageDownloaderService
	{
		Task DownloadImages(ImageType imageType);
	}
}