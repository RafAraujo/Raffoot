namespace RaffootLoader.Domain.Models
{
    public class Formation
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public IEnumerable<string> FieldLocalizationNames { get; set; }

        public Formation(int id, string name, IEnumerable<string> fieldLocalizationNames)
        {
            Id = id;
            Name = name;
            FieldLocalizationNames = fieldLocalizationNames;
        }
    }
}
