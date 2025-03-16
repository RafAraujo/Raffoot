using RaffootLoader.Domain.Enums;

namespace RaffootLoader.Domain.Models
{
    public class League(int externalId, string country, int division, Continent? continent) : Entity
    {
		public int ExternalId { get; set; } = externalId;
		public string Country { get; set; } = country;
		public int Division { get; set; } = division;
		public Continent? Continent { get; set; } = continent;
	}
}
