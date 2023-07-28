namespace RaffootLoader.Domain.Models
{
    public class Championship
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public int ChampionshipTypeId { get; set; }

        public int CountryId { get; set; }

        public int Division { get; set; }

        public int ClubCount { get; set; }

        public Championship(int id, string name, int championshipTypeId, int countryId, int division, int clubCount)
        {
            Id = id;
            Name = name;
            ChampionshipTypeId = championshipTypeId;
            CountryId = countryId;
            Division = division;
            ClubCount = clubCount;
        }
    }
}
