namespace RaffootLoader.Domain.Models
{
    public class FieldLocalization
    {
        public int Id { get; set; }

        public string PositionAbbreviation { get; set; }

        public int? Line { get; set; }

        public int? Column { get; set; }

        public string Name { get; set; }

        public FieldLocalization(int id, string positionAbbreviation, int? line, int? column, string name)
        {
            Id = id;
            PositionAbbreviation = positionAbbreviation;
            Line = line;
            Column = column;
            Name = name;
        }
    }
}
