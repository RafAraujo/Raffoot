namespace RaffootLoader.Domain.Models
{
    public class Position
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Abbreviation { get; set; }

        public string FieldRegion { get; set; }

        public Position(int id, string name, string abbreviation, string fieldRegion)
        {
            Id = id;
            Name = name;
            Abbreviation = abbreviation;
            FieldRegion = fieldRegion;
        }
    }
}
