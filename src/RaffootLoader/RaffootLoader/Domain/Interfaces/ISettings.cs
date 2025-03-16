using RaffootLoader.Domain.Enums;

namespace RaffootLoader.Domain.Interfaces
{
    public interface ISettings
    {
        string GameBaseFolder { get; set; }
        string ConsoleAppFolder { get; set; }
        DataSource DataSource { get; set; }
        int Year { get; set; }
        string HtmlFolder { get; }
        string ImageFolder { get; }
		string DbPath { get; }

        int MinYear { get; }
        int MaxYear { get; }
    }
}