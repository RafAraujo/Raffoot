using RaffootLoader.Domain.Models;

namespace RaffootLoader.Services.Interfaces
{
    public interface IDataExtractorService
    {
        Task CreateDatabase();
        Task<IEnumerable<Club>> GetClubs(IEnumerable<League> leagues);
        Task<IEnumerable<Player>> GetPlayers(IEnumerable<Club> clubs);
        void UpdateClubsColors();
        void UpdatePlayerHasPhotoFlag();
    }
}