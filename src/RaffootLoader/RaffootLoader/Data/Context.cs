using RaffootLoader.Domain.Models;

namespace RaffootLoader.Data
{
    public class Context
    {
        private readonly string _dbName;

        private IEnumerable<League> _leagues;
        private IEnumerable<Club> _clubs;
        private IEnumerable<Player> _players;
        private IEnumerable<Country> _countries;


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

        public Context(string dbName)
        {
            _dbName = dbName;
        }
    }
}
