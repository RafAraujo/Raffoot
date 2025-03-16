namespace RaffootLoader.Domain.Models
{
    public class Position : Entity
    {
        public string Name { get; set; }
        public string Abbreviation { get; set; }

        public Position(int id, string name, string abbreviation)
        {
            Id = id;
            Name = name;
            Abbreviation = abbreviation;
        }
    }
}
