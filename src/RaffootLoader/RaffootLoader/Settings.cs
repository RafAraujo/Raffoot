using RaffootLoader.Data.Interfaces;

namespace RaffootLoader
{
    public class Settings(string basePath, string dbPath, string imagesPath) : ISettings
    {
		public string BasePath { get; set; } = basePath;

		public string DbPath { get; set; } = dbPath;

		public string ImagesPath { get; set; } = imagesPath;
	}
}
