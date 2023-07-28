namespace RaffootLoader.Domain.Models
{
    public class Club
    {
        public int ExternalId { get; set; }

        public int LeagueId { get; set; }

        public string Name { get; set; }

        public string Logo { get; set; }

        public List<string> Kits { get; set; } = new();
    }
}
