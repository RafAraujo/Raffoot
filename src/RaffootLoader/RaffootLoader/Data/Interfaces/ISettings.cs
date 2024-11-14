using RaffootLoader.Domain.Enums;

namespace RaffootLoader.Data.Interfaces
{
    public interface ISettings
    {
        string GameBaseFolder { get; set; }
        string ConsoleAppFolder { get; set; }
        DataSource DataSource { get; set; }
        int Year { get; set; }
        string ImagesFolder { get; }
		string DbPath { get; }

        int MinYear { get; }
        int MaxYear { get; }
    }
}