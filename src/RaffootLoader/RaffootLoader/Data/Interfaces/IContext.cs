using RaffootLoader.Domain.Models;

namespace RaffootLoader.Data.Interfaces
{
    public interface IContext
    {
        IEnumerable<Club> Clubs { get; }
        IEnumerable<Country> Countries { get; }
        IEnumerable<League> Leagues { get; }
        IEnumerable<Player> Players { get; }
        IEnumerable<Position> Positions { get; }

        void DropDatabase();
        void InsertMany<T>(IEnumerable<T> items) where T : Entity;
    }
}