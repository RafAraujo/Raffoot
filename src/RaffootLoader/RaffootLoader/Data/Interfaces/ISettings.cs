namespace RaffootLoader.Data.Interfaces
{
    public interface ISettings
    {
        string BasePath { get; set; }
        string DbPath { get; set; }
        string ImagesPath { get; set; }
    }
}