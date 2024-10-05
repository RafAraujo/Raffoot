using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Services.DTO;
using RaffootLoader.Utils;

namespace RaffootLoader.Services
{
	public class SoFifaImageDownloaderService(IContext context, IImageService imageService) : IImageDownloaderService
	{
		private readonly HttpClient _client = new(new HttpClientHandler { AllowAutoRedirect = false });

		public async Task DownloadImages(ImageType imageType)
		{
			var tasks = new List<Task>();

			try
			{
				Console.WriteLine($"Downloading {imageType.ToString().ToLower()}s...");

				var imagesInfos = GetImagesInfos(imageType);
				imagesInfos = imagesInfos.Where(dto => !string.IsNullOrEmpty(dto.FilePath) && !File.Exists(dto.FilePath));
				tasks = imagesInfos.Select(dto => DownloadFile(dto.Url, dto.FilePath)).ToList();
				await Task.WhenAll(tasks).ConfigureAwait(false);
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}
			finally
			{
				Console.WriteLine("\tSuccess: {0}", tasks.Count(t => t.IsCompletedSuccessfully));
				Console.WriteLine("\tFailed: {0}", tasks.Count(t => t.IsFaulted));
				Console.WriteLine("\tTotal: {0}", tasks.Count);
			}
		}

		private IEnumerable<ImageInfoDto> GetImagesInfos(ImageType imageType)
		{
			return imageType switch
			{
				ImageType.Flag => context.Countries.Select(imageService.GetFlag),
				ImageType.Logo => context.Clubs.Select(imageService.GetLogo),
				ImageType.Kit => context.Clubs.SelectMany(imageService.GetKits),
				ImageType.Photo => context.Players.Select(imageService.GetPhoto),
				_ => [],
			};
		}

		private async Task DownloadFile(string url, string filePath)
		{
			using var stream = await _client.GetStreamAsync(url).ConfigureAwait(false);
			Directory.CreateDirectory(Path.GetDirectoryName(filePath));
			using var fileStream = new FileStream(filePath, FileMode.OpenOrCreate);
			await stream.CopyToAsync(fileStream);
		}
	}
}
