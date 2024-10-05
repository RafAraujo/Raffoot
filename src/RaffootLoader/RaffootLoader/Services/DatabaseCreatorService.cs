using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Services.Fifa;
using RaffootLoader.Utils;

namespace RaffootLoader.Services
{
	public class DatabaseCreatorService(ISettings settings, IContext context) : IDatabaseCreator
	{
		public async Task CreateDatabase()
		{
			try
			{
				if (context.DatabaseExists())
				{
					Console.WriteLine("Database already exists");
					return;
				}
				else
				{
					Console.WriteLine("Creating database...");
				}

				IFifaDataExtractorService extractor;

				if (settings.Year >= 2007)
				{
					extractor = new SoFifaDataExtractorService(settings);
				}
				else
				{
					extractor = new FifaIndexDataExtractorService(settings);
				}

				var dto = await extractor.GetFifaDatabase().ConfigureAwait(false);

				context.InsertMany(dto.Leagues);
				context.InsertMany(dto.Clubs);
				context.InsertMany(dto.Players);
				context.InsertMany(dto.Countries);
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}
		}
	}
}
