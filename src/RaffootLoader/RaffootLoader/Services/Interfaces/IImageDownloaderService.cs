namespace RaffootLoader.Services.Interfaces
{
    public interface IImageDownloaderService
    {
        Task DownloadFlags();
        Task DownloadKits();
        Task DownloadLogos();
        Task DownloadPhotos();
    }
}