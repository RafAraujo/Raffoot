namespace RaffootLoader.Domain.Models
{
    public class Country
    {
        public string Name { get; set; }

        public string Flag { get; set; }

        public Country(string name, string flag)
        {
            Name = name;
            Flag = flag;
        }
    }
}
