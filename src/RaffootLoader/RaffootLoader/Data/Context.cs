using RaffootLoader.Domain.Models;
using RaffootLoader.Utils;

namespace RaffootLoader.Data
{
    public class Context
    {
        private readonly string _dbName;

        private IEnumerable<League> _leagues;
        private IEnumerable<Club> _clubs;
        private IEnumerable<Player> _players;
        private IEnumerable<Country> _countries;
        private IEnumerable<Translation> _translations;

        public IEnumerable<League> Leagues
        {
            get => _leagues ??= new Repository<League>(_dbName).GetAll();
        }

        public IEnumerable<Club> Clubs
        {
            get => _clubs ??= new Repository<Club>(_dbName).GetAll();
        }

        public IEnumerable<Player> Players
        {
            get => _players ??= new Repository<Player>(_dbName).GetAll();
        }

        public IEnumerable<Country> Countries
        {
            get => _countries ??= new Repository<Country>(_dbName).GetAll();
        }

        public static IEnumerable<string> Languages
        {
            get => new[] { "de", "en", "es", "fr", "it", "nl", "pt", };
        }

        public IEnumerable<Translation> Translations
        {
            get => _translations is null || !_translations.Any() ? _translations = new Repository<Translation>(_dbName).GetAll() : _translations;
        }

        public Context(string dbName)
        {
            _dbName = dbName;
        }

        public bool DatabaseExists() => File.Exists(_dbName);

        public void DropDatabase()
        {
            try
            {
                Console.WriteLine("Dropping database...");

                if (File.Exists(_dbName))
                {
                    File.Move(_dbName, $"{_dbName}.old", true);
                }
                File.Delete(_dbName);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
        }

        public void InsertMany<T>(IEnumerable<T> items)
        {
            var repository = new Repository<T>(_dbName);
            repository.InsertMany(items);
        }
    }
}
