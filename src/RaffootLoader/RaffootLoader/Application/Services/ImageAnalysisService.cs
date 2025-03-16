using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Infrastructure.CrossCutting.Utils;
using System.Drawing;
using System.Text;

namespace RaffootLoader.Application.Services
{
	public class ImageAnalysisService(IContext context, IImageInfoService imageService, IRepository repository) : IImageAnalysisService
	{
		public void UpdateClubsColors()
		{
			try
			{
				if (!OperatingSystem.IsWindows())
				{
					Console.WriteLine("OS is not Windows");
					return;
				}

				var clubs = context.Clubs;

				Console.WriteLine("Updating clubs colors...");

				var sb = new StringBuilder();
				foreach (var club in clubs)
				{
					var logo = imageService.GetLogo(club);
					var kits = imageService.GetKits(club);

					var logoPath = logo.FilePath;
					var mainKitPath = kits.FirstOrDefault()?.FilePath;
					var path = File.Exists(mainKitPath) ? mainKitPath : logoPath;

					if (File.Exists(path) && OperatingSystem.IsWindows())
					{
						using var bitmap = BitmapService.ConvertToBitmap(path);
						var backgroundColor = BitmapService.GetAverageColor([bitmap]);
						var foregroundColor = BitmapService.PerceivedBrightness(backgroundColor) > 130 ? Color.Black : Color.White;

						club.BackgroundColor = backgroundColor.ToHexString();
						club.ForegroundColor = foregroundColor.ToHexString();
					}
				};

				Console.WriteLine();
				var current = 0;
				foreach (var club in clubs)
				{
					repository.Update(club);
					ConsoleUtils.ShowProgress(++current, clubs.Count, "Updating database: ");
				}
				Console.WriteLine();
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}
		}
	}
}
