using RaffootLoader.Application.DTO;
using RaffootLoader.Application.Interfaces.Services;
using RaffootLoader.Application.Interfaces.Services.DataExtractors;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.Fifa;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.FM;
using RaffootLoader.Application.Interfaces.Services.DataExtractors.PES;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Infrastructure.CrossCutting.Utils;

namespace RaffootLoader.Application.Services
{
    public class DatabaseCreatorService(
        ISettings settings,
        IContext context,
        IWePesStatsDataExtractorService wePesStatsDataExtractorService,
        IPesMasterDataExtractorService pesMasterDataExtractorService,
        IFifaIndexDataExtractorService fifaIndexDataExtractorService,
        ISoFifaDataExtractorService soFifaDataExtractorService,
        IFmInsideDataExtractorService fmInsideDataExtractorService) : IDatabaseCreatorService
    {
        public async Task CreateDatabase()
        {
            try
            {
                context.DropDatabase();

                Console.WriteLine("Creating database...");

                var mapping = GetMappings();

                var db = await mapping.Item1.GetDatabaseDto().ConfigureAwait(false);

                if (mapping.Item2 != null)
                {
                    var altDb = await mapping.Item2.GetDatabaseDto().ConfigureAwait(false);
                    PatchDatabase(db, altDb);
                }

                Directory.CreateDirectory(Path.GetDirectoryName(settings.DbPath));

                context.InsertMany(db.Clubs);
                context.InsertMany(db.Players);
                context.InsertMany(db.Countries);

                Console.WriteLine("Database created with success");
            }
            catch (OperationCanceledException ex)
            {
                ConsoleUtils.WriteWarning(ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
                throw;
            }
        }

        private Tuple<IDataExtractorService, IDataExtractorService> GetMappings()
        {
            var mappings = new List<Tuple<int, DataSource, IDataExtractorService, IDataExtractorService>>
            {
                new(2003, DataSource.Fifa, wePesStatsDataExtractorService, null),
                new(2004, DataSource.Fifa, wePesStatsDataExtractorService, null),
                new(2005, DataSource.Fifa, fifaIndexDataExtractorService, null),
                new(2006, DataSource.Fifa, fifaIndexDataExtractorService, null),
                new(2007, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2008, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2009, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2010, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2011, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2012, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2013, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2014, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2015, DataSource.Fifa, soFifaDataExtractorService, pesMasterDataExtractorService),
                new(2016, DataSource.Fifa, soFifaDataExtractorService, pesMasterDataExtractorService),
                new(2017, DataSource.Fifa, soFifaDataExtractorService, pesMasterDataExtractorService),
                new(2018, DataSource.Fifa, soFifaDataExtractorService, pesMasterDataExtractorService),
                new(2019, DataSource.Fifa, soFifaDataExtractorService, pesMasterDataExtractorService),
                new(2020, DataSource.Fifa, soFifaDataExtractorService, pesMasterDataExtractorService),
                new(2021, DataSource.Fifa, soFifaDataExtractorService, pesMasterDataExtractorService),
                new(2022, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2023, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2024, DataSource.Fifa, soFifaDataExtractorService, null),
                new(2025, DataSource.Fifa, soFifaDataExtractorService, null),

                new(2024, DataSource.FM, fmInsideDataExtractorService, null),
            };

            var mapping = mappings.Single(m => m.Item1 == settings.Year && m.Item2 == settings.DataSource);
            return new Tuple<IDataExtractorService, IDataExtractorService>(mapping.Item3, mapping.Item4);
        }

        private static void PatchDatabase(DatabaseDto mainDb, DatabaseDto altDb)
        {
            var altCountries = altDb.Clubs.Select(c => c.Country).Distinct().ToList();
            var clubsToRemove = mainDb.Clubs.Where(c => altCountries.Contains(c.Country)).ToList();
            var playersToRemove = mainDb.Players.Where(p => clubsToRemove.Select(l => l.ExternalId).Contains(p.ClubId)).ToList();

            if (clubsToRemove.Count > 0)
            {
                mainDb.Clubs = [.. mainDb.Clubs.Where(c => !clubsToRemove.Select(c => c.ExternalId).Contains(c.ExternalId))];
                mainDb.Players = [.. mainDb.Players.Where(p => !playersToRemove.Select(p => p.ExternalId).Contains(p.ExternalId))];
            }

            foreach (var altClub in altDb.Clubs)
            {
                var clubExternalId = mainDb.Clubs.Any(c => c.ExternalId == altClub.ExternalId) ? altClub.ExternalId * -1 : altClub.ExternalId;

                var mainClub = clubsToRemove.SingleOrDefault(c => c.Name == altClub.Name && c.Country == altClub.Country);
                var club = new Club
                {
                    ExternalId = clubExternalId,
                    Country = altClub.Country,
                    Name = altClub.Name,
                    Logo = mainClub?.Logo,
                    Kits = mainClub?.Kits,
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

