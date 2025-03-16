using RaffootLoader.Domain.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Infrastructure.CrossCutting.Utils;

namespace RaffootLoader.Infrastructure.Data
{
	public class Context(ISettings settings, IRepository repository) : IContext
	{
		private List<Position> positions;

		public List<Club> Clubs => repository.GetAll<Club>();
		public List<Player> Players => repository.GetAll<Player>();
		public List<Country> Countries => repository.GetAll<Country>();

		public List<Position> Positions
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

		public void InsertMany<T>(IEnumerable<T> items) where T : Entity => repository.InsertMany(items);
	}
}
