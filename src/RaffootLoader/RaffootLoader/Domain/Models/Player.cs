namespace RaffootLoader.Domain.Models
{
    public class Player : Entity
    {
        public int ExternalId { get; set; }

        public int ClubId { get; set; }

        public List<string> Positions { get; set; } = new List<string>();

        public string Country { get; set; }

        public int Overall { get; set; }

        public int Potential { get; set; }

        public string Name { get; set; }

        public string FullName { get; set; }

        public int Age { get; set; }

        public int JerseyNumber { get; set; }

        public int EndOfContract { get; set; }

        public string Photo { get; set; }

        public bool HasPhoto { get; set; }
    }
}
