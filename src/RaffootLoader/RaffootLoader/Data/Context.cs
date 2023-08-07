using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Utils;

namespace RaffootLoader.Data
{
    public class Context : IContext
    {
        private readonly string _dbPath;

        private IEnumerable<League> _leagues;
        private IEnumerable<Club> _clubs;
        private IEnumerable<Player> _players;
        private IEnumerable<Country> _countries;
        private IEnumerable<Translation> _translations;

        public IEnumerable<League> Leagues
        {
            get => _leagues ??= new Repository<League>(_dbPath).GetAll();
        }

        public IEnumerable<Club> Clubs
        {
            get => _clubs ??= new Repository<Club>(_dbPath).GetAll();
        }

        public IEnumerable<Player> Players
        {
            get => _players ??= new Repository<Player>(_dbPath).GetAll();
        }

        public IEnumerable<Country> Countries
        {
            get => _countries ??= new Repository<Country>(_dbPath).GetAll();
        }

        public static IEnumerable<string> Languages
        {
            get => new[] { "de", "en", "es", "fr", "it", "nl", "pt-BR", };
        }

        public IEnumerable<Translation> Translations
        {
            get => _translations is null || !_translations.Any() ? _translations = new Repository<Translation>(_dbPath).GetAll() : _translations;
        }

        public Context(string dbName)
        {
            _dbPath = dbName;
        }

        public bool DatabaseExists() => File.Exists(_dbPath);

        public void DropDatabase()
        {
            try
            {
                Console.WriteLine("Dropping database...");

                if (File.Exists(_dbPath))
                {
                    File.Move(_dbPath, $"{_dbPath}.old", true);
                }
                File.Delete(_dbPath);
            }
            catch (Exception ex)
            {
                ConsoleUtils.ShowException(ex);
            }
        }

        public void InsertMany<T>(IEnumerable<T> items)
        {
            var repository = new Repository<T>(_dbPath);
            repository.InsertMany(items);
        }
    }
}
