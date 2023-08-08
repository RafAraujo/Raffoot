using RaffootLoader.Data.Interfaces;

namespace RaffootLoader.Data
{
    public class SettingsManager : ISettingsManager
    {
        public string BasePath { get; set; }

        public string DbPath { get; set; }

        public string ImagesPath { get; set; }

        public SettingsManager(string basePath, string dbPath, string imagesPath)
        {
            BasePath = basePath;
            DbPath = dbPath;
            ImagesPath = imagesPath;
        }
    }
}
