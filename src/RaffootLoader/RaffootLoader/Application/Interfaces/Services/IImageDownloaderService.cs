using RaffootLoader.Domain.Enums;

namespace RaffootLoader.Application.Interfaces.Services
{
	public interface IImageDownloaderService
	{
		Task DownloadImages();
	}
}