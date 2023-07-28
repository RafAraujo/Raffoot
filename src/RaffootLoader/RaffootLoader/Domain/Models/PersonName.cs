namespace RaffootLoader.Domain.Models
{
    public class PersonName
    {
        public int CountryId { get; set; }

        public string Name { get; set; }

        public PersonName(int countryId, string name)
        {
            CountryId = countryId;
            Name = name;
        }
    }
}
