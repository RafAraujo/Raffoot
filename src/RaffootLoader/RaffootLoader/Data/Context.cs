using LiteDB;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Utils;

namespace RaffootLoader.Data
{
    public class Context(
        ISettings settings,
        IRepository<League> leagueRepository,
        IRepository<Club> clubRepository,
        IRepository<Player> playerRepository,
        IRepository<Country> countryRepository,
        IRepository<Translation> translationRepository) : IContext
    {
        private readonly ISettings _settings = settings;

        private readonly IRepository<Club> _clubRepository = clubRepository;
        private readonly IRepository<Country> _countryRepository = countryRepository;
        private readonly IRepository<League> _leagueRepository = leagueRepository;
        private readonly IRepository<Player> _playerRepository = playerRepository;
        private readonly IRepository<Translation> _translationRepository = translationRepository;

        private IEnumerable<Club> _clubs;
        private IEnumerable<Country> _countries;
        private IEnumerable<League> _leagues;
        private IEnumerable<Player> _players;
        private IEnumerable<Position> _positions;

        public IEnumerable<Club> Clubs
        {
            get => _clubs ??= _clubRepository.GetAll();
        }

        public IEnumerable<League> Leagues
        {
            get => _leagues ??= _leagueRepository.GetAll();
        }

        public IEnumerable<Player> Players
        {
            get => _players ??= _playerRepository.GetAll();
        }

        public IEnumerable<Country> Countries
        {
            get => _countries ??= _countryRepository.GetAll();
        }

        public IEnumerable<Position> Positions
        {
            get => _positions ??=
			[
				new Position(1, "Goalkeeper", "GK"),
                new Position(2, "Centre-Back", "CB"),
                new Position(3, "Left-Back", "LB"),
                new Position(4, "Right-Back", "RB"),
                new Position(5, "Left Wing-Back", "LWB"),
                new Position(6, "Right Wing-Back", "RWB"),
                new Position(7, "Defensive Midfielder", "CDM"),
                new Position(8, "Centre Midfielder", "CM"),
                new Position(9, "Left Midfielder", "LM"),
                new Position(10, "Right Midfielder", "RM"),
                new Position(11, "Attacking Midfielder", "CAM"),
                new Position(12, "Left Winger", "LW"),
                new Position(13, "Right Winger", "RW"),
                new Position(14, "Centre Forward", "CF"),
                new Position(15, "Striker", "ST"),
            ];
        }

        public static IEnumerable<string> Languages
        {
            get => ["de", "en", "es", "fr", "it", "nl", "pt-BR"];
        }

        public IEnumerable<Translation> Translations
        {
            get => _translationRepository.GetAll();
        }

        public bool DatabaseExists() => File.Exists(_settings.DbPath);

        public void DropDatabase()
        {
            try
            {
                Console.WriteLine("Dropping database...");

                if (File.Exists(_settings.DbPath))
                {
                    File.Move(_settings.DbPath, $"{_settings.DbPath}.old", true);
                }
                File.Delete(_settings.DbPath);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
        }

        public bool DropCollection(string name)
        {
            using var db = new LiteDatabase(_settings.DbPath);
            return db.DropCollection(name);
        }

        public void InsertMany<T>(IEnumerable<T> items) where T : Entity
        {
            var repository = new Repository<T>(_settings);
            repository.InsertMany(items);
        }
    }
}
