using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Utils;
using System.Drawing;
using System.Text;

namespace RaffootLoader.Services
{
	public class ImageAnalysisService(IContext context, IImageService imageService, IRepository<Club> clubRepository) : IImageAnalysisService
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

				var leagues = context.Leagues;
				var clubs = context.Clubs;

				Console.WriteLine("Updating clubs colors...");

				var sb = new StringBuilder();
				_ = Parallel.ForEach(clubs, club =>
				{
					var logoPath = imageService.GetLogo(club).FilePath;
					var mainKitPath = imageService.GetKits(club).FirstOrDefault()?.FilePath;
					var path = File.Exists(mainKitPath) ? mainKitPath : logoPath;

					if (File.Exists(path) && OperatingSystem.IsWindows())
					{
						using var bitmap = BitmapService.ConvertToBitmap(path);
						var backgroundColor = BitmapService.GetAverageColor([bitmap]);
						var foregroundColor = BitmapService.PerceivedBrightness(backgroundColor) > 130 ? Color.Black : Color.White;

						club.BackgroundColor = backgroundColor.ToHexString();
						club.ForegroundColor = foregroundColor.ToHexString();
					}
				});

				Console.WriteLine();
				var current = 0;
				foreach (var club in clubs)
				{
					clubRepository.Update(club);
					ConsoleUtils.ShowProgress(++current, clubs.Count(), "Updating database: ");
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
