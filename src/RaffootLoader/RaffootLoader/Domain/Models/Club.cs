using RaffootLoader.Domain.Enums;

namespace RaffootLoader.Domain.Models
{
	public class Club : Entity
	{
		public int ExternalId { get; set; }
		public int LeagueId { get; set; }
		public string Name { get; set; }
		public string ShortName { get; set; }
		public string Logo { get; set; }
		public List<string> Kits { get; set; } = [];
		public string BackgroundColor { get; set; }
		public string ForegroundColor { get; set; }

		public string GetFileName()
		{
			return Name.Replace('/', '-');
		}
	}
}
