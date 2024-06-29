namespace RaffootLoader.Domain.Models
{
    public class Country : Entity
    {
        public string Name { get; set; }
        public string Flag { get; set; }
        public string Continent { get; set; }

        public Country(string name, string flag, string continent)
        {
            Name = name;
            Flag = flag;
            Continent = continent;
        }
    }
}
