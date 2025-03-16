using RaffootLoader.Domain.Models;

namespace RaffootLoader.Application.DTO
{
	public class DatabaseDto
	{
		public int Year { get; set; }
		public List<Club> Clubs { get; set; } = [];
		public List<Player> Players { get; set; } = [];
		public List<Country> Countries { get; set; } = [];
	}
}
