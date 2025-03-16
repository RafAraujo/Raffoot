using RaffootLoader.Application.DTO;
using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Infrastructure.CrossCutting.Utils;

namespace RaffootLoader.Application.Services
{
	public class ImageDownloaderService(IContext context, IImageInfoService imageService) : IImageDownloaderService
	{
		private readonly HttpClient _client = new(new HttpClientHandler { AllowAutoRedirect = false });

		public async Task DownloadImages()
		{
			foreach (var imageType in Enum.GetValues<ImageType>())
				await DownloadImages(imageType).ConfigureAwait(false);
		}

		private async Task DownloadImages(ImageType imageType)
		{
			var tasks = new List<Task>();

			Console.WriteLine($"Downloading {imageType.ToString().ToLower()}s...");

			var imagesInfos = GetImagesInfos(imageType);
			imagesInfos = [.. imagesInfos.Where(dto => !string.IsNullOrEmpty(dto.FilePath) && !File.Exists(dto.FilePath))];

			const int BatchSize = 1000;
			for (var i = 0; i < imagesInfos.Count; i += BatchSize)
			{
				var currentBatch = imagesInfos.Skip(i).Take(BatchSize);
				var batchTasks = currentBatch.Select(dto =>
				{
					var batchTask = DownloadFile(dto.Url, dto.FilePath);
					tasks.Add(batchTask);
					return batchTask;
				});

				try
				{
					await Task.WhenAll(batchTasks).ConfigureAwait(false);
				}
				catch (Exception ex)
				{
					ConsoleUtils.ShowException(ex);
				}
			}

			Console.WriteLine("\tSuccess: {0}", tasks.Count(t => t.IsCompletedSuccessfully));
			Console.WriteLine("\tFailed: {0}", tasks.Count(t => t.IsFaulted));
			Console.WriteLine("\tTotal: {0}", tasks.Count);
		}

		private List<ImageInfoDto> GetImagesInfos(ImageType imageType)
		{
			return imageType switch
			{
				ImageType.Flag => [.. context.Countries.Select(imageService.GetFlag)],
				ImageType.Logo => [.. context.Clubs.Select(imageService.GetLogo)],
				ImageType.Kit => [.. context.Clubs.SelectMany(imageService.GetKits)],
				ImageType.Photo => [.. context.Players.Select(imageService.GetPhoto)],
				_ => [],
			};
		}

		private async Task DownloadFile(string url, string filePath, bool writeLog = false)
		{
			try
			{
				using var stream = await _client.GetStreamAsync(url).ConfigureAwait(false);
				Directory.CreateDirectory(Path.GetDirectoryName(filePath));
				using var fileStream = new FileStream(filePath, FileMode.CreateNew);
				await stream.CopyToAsync(fileStream).ConfigureAwait(false);
			}
			catch (Exception ex)
			{
				var message = string.Format("{0}: {1}", Path.GetFileNameWithoutExtension(filePath), ex.Message);
				if (writeLog)
					ConsoleUtils.WriteError(message);
				throw;
			}

		}
	}
}
