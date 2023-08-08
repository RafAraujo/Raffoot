namespace RaffootLoader.Data.Interfaces
{
    public interface ISettingsManager
    {
        string BasePath { get; set; }
        string DbPath { get; set; }
        string ImagesPath { get; set; }
    }
}