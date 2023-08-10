using RaffootLoader.Data.Interfaces;

namespace RaffootLoader
{
    public class Settings : ISettings
    {
        public string BasePath { get; set; }

        public string DbPath { get; set; }

        public string ImagesPath { get; set; }

        public Settings(string basePath, string dbPath, string imagesPath)
        {
            BasePath = basePath;
            DbPath = dbPath;
            ImagesPath = imagesPath;
        }
    }
}
