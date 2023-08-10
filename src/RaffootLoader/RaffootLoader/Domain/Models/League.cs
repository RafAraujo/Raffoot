using RaffootLoader.Domain.Enums;

namespace RaffootLoader.Domain.Models
{
    public class League : Entity
    {
        public int ExternalId { get; set; }

        public string Country { get; set; }

        public int Division { get; set; }

        public Continent Continent { get; set; }

        public League(int externalId, string country, int division, Continent continent)
        {
            ExternalId = externalId;
            Country = country;
            Division = division;
            Continent = continent;
        }
    }
}
