namespace RaffootLoader.Domain.Models
{
    public class Position : Entity
    {
        public string Name { get; set; }

        public string Abbreviation { get; set; }

        public Position(string name, string abbreviation)
        {
            Name = name;
            Abbreviation = abbreviation;
        }
    }
}
