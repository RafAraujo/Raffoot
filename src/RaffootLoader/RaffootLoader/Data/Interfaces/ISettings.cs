namespace RaffootLoader.Data.Interfaces
{
    public interface ISettings
    {
        string BaseFolder { get; set; }
        string AppFolder { get; set; }
        string ImagesFolder { get; set; }
        int Year { get; set; }
		string DbPath { get; }
    }
}