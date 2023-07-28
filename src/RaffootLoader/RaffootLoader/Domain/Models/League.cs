namespace RaffootLoader.Domain.Models
{
    public class League
    {
        public int ExternalId { get; set; }

        public string Country { get; set; }

        public int Division { get; set; }

        public League(int externalId, string country, int division)
        {
            ExternalId = externalId;
            Country = country;
            Division = division;
        }
    }
}
