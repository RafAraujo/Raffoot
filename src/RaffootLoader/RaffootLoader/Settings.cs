using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;

namespace RaffootLoader
{
	public class Settings(string gameBaseFolder, string consoleAppFolder) : ISettings
	{
		public string GameBaseFolder { get; set; } = gameBaseFolder;
		public string ConsoleAppFolder { get; set; } = consoleAppFolder;
		public DataSource DataSource { get; set; } = DataSource.Fifa;
		public int Year { get; set; } = GetMaxYear();

		public string ImagesFolder => Path.Combine(GameBaseFolder, "Raffoot.UI", "Pages", "res", "image", "data sources", DataSource.ToString());
		public string DbPath => Path.Combine(ConsoleAppFolder, "Databases", DataSource.ToString(), $"Raffoot{Year}.db");

		public int MinYear => DataSource == DataSource.Fifa ? 2003 : 2024;
		public int MaxYear => DataSource == DataSource.Fifa ? GetMaxYear() : 2024;

		private static int GetMaxYear() => DateTime.Now.Month < 9 ? DateTime.Now.Year : DateTime.Now.Year + 1;
	}
}
