namespace RaffootLoader.Domain.Models
{
	public class Club : Entity
	{
		public int ExternalId { get; set; }
		public string Name { get; set; }
		public string Country { get; set; }
		public string Status { get; set; }
		public string Logo { get; set; }
		public List<string> Kits { get; set; } = [];
		public string BackgroundColor { get; set; }
		public string ForegroundColor { get; set; }
		public string Link { get; set; }
		public bool IsProcessingFinished { get; set; }

		public string GetFileName() => Name.Replace('/', '-');
	}
}
