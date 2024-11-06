using RaffootLoader.Data.Interfaces;

namespace RaffootLoader
{
    public class Settings(string baseFolder, string dbFolder, string imagesPath, int year) : ISettings
    {
		public string BaseFolder { get; set; } = baseFolder;
		public string AppFolder { get; set; } = dbFolder;
		public string ImagesFolder { get; set; } = imagesPath;
		public int Year { get; set; } = year;

		public string DbPath
		{
			get => @$"{AppFolder}\Raffoot{Year}.db";
		}
	}
}
