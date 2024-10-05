using RaffootLoader.Domain.Models;

namespace RaffootLoader.Services.DTO
{
	public class FifaDatabaseDto
	{
		public int Year { get; set; }
		public IEnumerable<League> Leagues { get; set; }
		public IEnumerable<Club> Clubs { get; set; }
		public IEnumerable<Player> Players { get; set; }
		public IEnumerable<Country> Countries { get; set; }
	}
}
