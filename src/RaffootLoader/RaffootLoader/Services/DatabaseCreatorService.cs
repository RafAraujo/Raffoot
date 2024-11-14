using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.DTO;
using RaffootLoader.Services.Fifa;
using RaffootLoader.Services.FM;
using RaffootLoader.Services.PES;
using RaffootLoader.Utils;

namespace RaffootLoader.Services
{
	public class DatabaseCreatorService(ISettings settings, IContext context) : IDatabaseCreatorService
	{
		public async Task CreateDatabase()
		{
			try
			{
				context.DropDatabase();

				Console.WriteLine("Creating database...");

				var mapping = GetMappings();

				var db = await mapping.Item1.GetDatabase().ConfigureAwait(false);

				if (mapping.Item2 != null)
				{
					var altDb = await mapping.Item2.GetDatabase().ConfigureAwait(false);
					PatchDatabase(db, altDb);
				}

				context.InsertMany(db.Leagues);
				context.InsertMany(db.Clubs);
				context.InsertMany(db.Players);
				context.InsertMany(db.Countries);

				File.Delete($"{settings.DbPath}.old");
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}
		}

		private Tuple<IDataExtractorService, IDataExtractorService> GetMappings()
		{
			var wePesStatsWebScraperService = new WePesStatsWebScraperService(settings);
			var excelReaderService = new ExcelReaderService(settings);
			var fifaIndexWebScraperService = new FifaIndexWebScraperService(settings);
			var soFifaWebScraperService = new SoFifaWebScraperService(settings);
			var pesMasterWebScraperService = new PesMasterWebScraperService(settings);

			var fmInsiderWebScraperService = new FmInsideWebScraperService(settings);

			var mappings = new List<Tuple<int, DataSource, IDataExtractorService, IDataExtractorService>>
			{
				new(2003, DataSource.FifaPes, wePesStatsWebScraperService, null),
				new(2004, DataSource.FifaPes, wePesStatsWebScraperService, null),
				new(2005, DataSource.FifaPes, fifaIndexWebScraperService, null),
				new(2006, DataSource.FifaPes, fifaIndexWebScraperService, null),
				new(2007, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2008, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2009, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2010, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2011, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2012, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2013, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2014, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2015, DataSource.FifaPes, soFifaWebScraperService, pesMasterWebScraperService),
				new(2016, DataSource.FifaPes, soFifaWebScraperService, pesMasterWebScraperService),
				new(2017, DataSource.FifaPes, soFifaWebScraperService, pesMasterWebScraperService),
				new(2018, DataSource.FifaPes, soFifaWebScraperService, pesMasterWebScraperService),
				new(2019, DataSource.FifaPes, soFifaWebScraperService, pesMasterWebScraperService),
				new(2020, DataSource.FifaPes, soFifaWebScraperService, pesMasterWebScraperService),
				new(2021, DataSource.FifaPes, soFifaWebScraperService, pesMasterWebScraperService),
				new(2022, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2023, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2024, DataSource.FifaPes, soFifaWebScraperService, null),
				new(2025, DataSource.FifaPes, soFifaWebScraperService, null),

				new(2024, DataSource.FootballManager, fmInsiderWebScraperService, null),
			};

			var mapping = mappings.Single(m => m.Item1 == settings.Year && m.Item2 == settings.DataSource);
			return new Tuple<IDataExtractorService, IDataExtractorService>(mapping.Item3, mapping.Item4);
		}

		private static void PatchDatabase(DatabaseDto mainDb, DatabaseDto altDb)
		{
			var altLeaguesCountries = altDb.Leagues.Select(l => l.Country).Distinct().ToList();

			var leaguesToRemove = mainDb.Leagues.Where(l => altLeaguesCountries.Contains(l.Country)).ToList();
			var clubsToRemove = mainDb.Clubs.Where(c => leaguesToRemove.Select(l => l.ExternalId).Contains(c.LeagueId)).ToList();
			var playersToRemove = mainDb.Players.Where(p => clubsToRemove.Select(l => l.ExternalId).Contains(p.ClubId)).ToList();

			if (clubsToRemove.Count > 0)
			{
				mainDb.Clubs = mainDb.Clubs.Where(c => !clubsToRemove.Select(c => c.ExternalId).Contains(c.ExternalId)).ToList();
				mainDb.Players = mainDb.Players.Where(p => !playersToRemove.Select(p => p.ExternalId).Contains(p.ExternalId)).ToList();
			}

			foreach (var altClub in altDb.Clubs)
			{
				var altLeague = altDb.Leagues.Single(l => l.ExternalId == altClub.LeagueId);
				var mainLeague = mainDb.Leagues.Single(l => l.Country == altLeague.Country && l.Division == altLeague.Division);
				mainLeague.IsPatched = true;

				var clubExternalId = mainDb.Clubs.Any(c => c.ExternalId == altClub.ExternalId) ? altClub.ExternalId * -1 : altClub.ExternalId;

				var fifaClub = clubsToRemove.SingleOrDefault(c => c.Name == altClub.Name && c.LeagueId == mainLeague.ExternalId);
				var club = new Club
				{
					ExternalId = clubExternalId,
					LeagueId = mainLeague.ExternalId,
					Name = altClub.Name,
					Logo = fifaClub?.Logo,
					Kits = fifaClub?.Kits,
				};

				mainDb.Clubs.Add(club);

				foreach (var altPlayer in altDb.Players.Where(p => p.ClubId == altClub.ExternalId))
				{
					var player = new Player
					{
						ExternalId = altPlayer.ExternalId * -1,
						Name = altPlayer.Name,
						FullName = altPlayer.Name,
						Country = altPlayer.Country,
						Positions = altPlayer.Positions,
						Age = altPlayer.Age,
						Overall = altPlayer.Overall,
						Potential = altPlayer.Potential,
						JerseyNumber = altPlayer.JerseyNumber,
						Photo = altPlayer.Photo,
						ClubId = clubExternalId,
					};

					mainDb.Players.Add(player);

					if (!mainDb.Countries.Any(c => c.Name == player.Country))
						mainDb.Countries.Add(new Country(player.Country, null, null));
				}
			}
		}
	}
}

