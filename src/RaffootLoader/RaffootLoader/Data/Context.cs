using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Utils;

namespace RaffootLoader.Data
{
    public class Context : IContext
    {
        private readonly ISettingsManager _settingsManager;
        private readonly IRepository<League> _leagueRepository;
        private readonly IRepository<Club> _clubRepository;
        private readonly IRepository<Player> _playerRepository;
        private readonly IRepository<Country> _countryRepository;
        private readonly IRepository<Translation> _translationRepository;

        private IEnumerable<League> _leagues;
        private IEnumerable<Club> _clubs;
        private IEnumerable<Player> _players;
        private IEnumerable<Country> _countries;

        public IEnumerable<League> Leagues
        {
            get => _leagues ??= _leagueRepository.GetAll();
        }

        public IEnumerable<Club> Clubs
        {
            get => _clubs ??= _clubRepository.GetAll();
        }

        public IEnumerable<Player> Players
        {
            get => _players ??= _playerRepository.GetAll();
        }

        public IEnumerable<Country> Countries
        {
            get => _countries ??= _countryRepository.GetAll();
        }

        public static IEnumerable<string> Languages
        {
            get => new[] { "de", "en", "es", "fr", "it", "nl", "pt-BR", };
        }

        public IEnumerable<Translation> Translations
        {
            get => _translationRepository.GetAll();
        }

        public Context(
            ISettingsManager settingsManager,
            IRepository<League> leagueRepository,
            IRepository<Club> clubRepository,
            IRepository<Player> playerRepository,
            IRepository<Country> countryRepository,
            IRepository<Translation> translationRepository)
        {
            _settingsManager = settingsManager;
            _leagueRepository = leagueRepository;
            _clubRepository = clubRepository;
            _playerRepository = playerRepository;
            _countryRepository = countryRepository;
            _translationRepository = translationRepository;
        }

        public bool DatabaseExists() => File.Exists(_settingsManager.DbPath);

        public void DropDatabase()
        {
            try
            {
                Console.WriteLine("Dropping database...");

                if (File.Exists(_settingsManager.DbPath))
                {
                    File.Move(_settingsManager.DbPath, $"{_settingsManager.DbPath}.old", true);
                }
                File.Delete(_settingsManager.DbPath);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
        }

        public void InsertMany<T>(IEnumerable<T> items) where T : Entity
        {
            var repository = new Repository<T>(_settingsManager);
            repository.InsertMany(items);
        }
    }
}
