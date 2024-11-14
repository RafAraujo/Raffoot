using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;

namespace RaffootLoader
{
	public class Settings(string baseFolder, string dbFolder) : ISettings
	{
		public string GameBaseFolder { get; set; } = baseFolder;
		public string ConsoleAppFolder { get; set; } = dbFolder;
		public DataSource DataSource { get; set; } = DataSource.FifaPes;
		public int Year { get; set; } = GetMaxYear();

		public string ImagesFolder => Path.Combine(GameBaseFolder, "Raffoot.UI", "Pages", "res", "image", "modes", DataSource == DataSource.FootballManager ? "brazil" : "default");
		public string DbPath => Path.Combine(ConsoleAppFolder, "Databases", DataSource.ToString(), $"Raffoot{Year}.db");

		public int MinYear => DataSource == DataSource.FifaPes ? 2003 : 2024;
		public int MaxYear => DataSource == DataSource.FifaPes ? GetMaxYear() : 2024;

		private static int GetMaxYear() => DateTime.Now.Month < 9 ? DateTime.Now.Year : DateTime.Now.Year + 1;
	}
}
