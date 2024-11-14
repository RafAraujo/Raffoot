using LiteDB;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Utils;

namespace RaffootLoader.Data
{
	public class Context(
		ISettings settings,
		IRepository<League> leagueRepository,
		IRepository<Club> clubRepository,
		IRepository<Player> playerRepository,
		IRepository<Country> countryRepository) : IContext
	{
		private IEnumerable<Position> positions;

		public IEnumerable<Club> Clubs => clubRepository.GetAll();
		public IEnumerable<League> Leagues => leagueRepository.GetAll();
		public IEnumerable<Player> Players => playerRepository.GetAll();
		public IEnumerable<Country> Countries => countryRepository.GetAll();

		public IEnumerable<Position> Positions
		{
			get => positions ??=
			[
				new(1, "Goalkeeper", "GK"),
				new(2, "Centre-Back", "CB"),
				new(3, "Left-Back", "LB"),
				new(4, "Right-Back", "RB"),
				new(5, "Left Wing-Back", "LWB"),
				new(6, "Right Wing-Back", "RWB"),
				new(7, "Defensive Midfielder", "CDM"),
				new(8, "Centre Midfielder", "CM"),
				new(9, "Left Midfielder", "LM"),
				new(10, "Right Midfielder", "RM"),
				new(11, "Attacking Midfielder", "CAM"),
				new(12, "Left Winger", "LW"),
				new(13, "Right Winger", "RW"),
				new(14, "Centre Forward", "CF"),
				new(15, "Striker", "ST"),
			];
		}

		public void DropDatabase()
		{
			try
			{
				if (File.Exists(settings.DbPath))
					File.Move(settings.DbPath, $"{settings.DbPath}.old", true);
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}
		}

		public bool DropCollection(string name)
		{
			using var db = new LiteDatabase(settings.DbPath);
			return db.DropCollection(name);
		}

		public void InsertMany<T>(IEnumerable<T> items) where T : Entity
		{
			var repository = new Repository<T>(settings);
			repository.InsertMany(items);
		}
	}
}
