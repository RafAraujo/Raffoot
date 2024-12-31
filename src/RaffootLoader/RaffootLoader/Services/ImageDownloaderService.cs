using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Services.DTO;
using RaffootLoader.Utils;

namespace RaffootLoader.Services
{
	public class ImageDownloaderService(IContext context, IImageService imageService) : IImageDownloaderService
	{
		private readonly HttpClient client = new(new HttpClientHandler { AllowAutoRedirect = false });

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
			imagesInfos = imagesInfos.Where(dto => !string.IsNullOrEmpty(dto.FilePath) && !File.Exists(dto.FilePath)).ToList();

			const int BatchSize = 5000;
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
				ImageType.Flag => context.Countries.Select(imageService.GetFlag).ToList(),
				ImageType.Logo => context.Clubs.Select(imageService.GetLogo).ToList(),
				ImageType.Kit => context.Clubs.SelectMany(imageService.GetKits).ToList(),
				ImageType.Photo => context.Players.Select(imageService.GetPhoto).ToList(),
				_ => [],
			};
		}

		private async Task DownloadFile(string url, string filePath, bool writeLog = false)
		{
			try
			{
				using var stream = await client.GetStreamAsync(url).ConfigureAwait(false);
				Directory.CreateDirectory(Path.GetDirectoryName(filePath));
				using var fileStream = new FileStream(filePath, FileMode.CreateNew);
				await stream.CopyToAsync(fileStream);
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
