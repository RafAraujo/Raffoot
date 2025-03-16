namespace RaffootLoader.Domain.Models
{
    public class Country(string name, string flag, string continent) : Entity
    {
		public string Name { get; set; } = name;
		public string Flag { get; set; } = flag;
		public string Continent { get; set; } = continent;
	}
}
