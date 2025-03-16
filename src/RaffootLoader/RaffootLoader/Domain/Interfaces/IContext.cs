using RaffootLoader.Domain.Models;

namespace RaffootLoader.Domain.Interfaces
{
    public interface IContext
    {
		List<Club> Clubs { get; }
		List<Country> Countries { get; }
		List<Player> Players { get; }
		List<Position> Positions { get; }

        void DropDatabase();
        void InsertMany<T>(IEnumerable<T> items) where T : Entity;
    }
}