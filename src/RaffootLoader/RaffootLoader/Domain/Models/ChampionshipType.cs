using RaffootLoader.Utils;

namespace RaffootLoader.Domain.Models
{
    public class ChampionshipType
    {
        public string Name { get; set; }

        public string Scope { get; set; }

        public string Format { get; set; }

        public ChampionshipType(string scope, string format)
        {
            Name = string.Format("{0} {1}", scope.ToTitleCase(), format.ToTitleCase());
            Scope = scope;
            Format = format;
        }
    }
}
