using LiteDB;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Fifa.Abstract;
using RaffootLoader.Utils;

namespace RaffootLoader.Data
{
	public class Context(
		ISettings settings,
		IRepository<League> leagueRepository,
		IRepository<Club> clubRepository,
		IRepository<Player> playerRepository,
		IRepository<Country> countryRepository,
		IRepository<Translation> translationRepository) : IContext
	{
		private IEnumerable<Position> _positions;

		public IEnumerable<Club> Clubs
		{
			get => GetClubsWithStandardizedName();
		}

		public IEnumerable<League> Leagues
		{
			get => leagueRepository.GetAll();
		}

		public IEnumerable<Player> Players
		{
			get => GetPlayersWithStandardizedCountryName();
		}

		public IEnumerable<Country> Countries
		{
			get => GetCountriesWithStandardizedName();
		}

		public IEnumerable<Position> Positions
		{
			get => _positions ??=
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

		public IEnumerable<Translation> Translations
		{
			get => translationRepository.GetAll();
		}

		public bool DatabaseExists() => File.Exists(settings.DbPath);

		public void DropDatabase()
		{
			try
			{
				Console.WriteLine("Dropping database...");

				if (File.Exists(settings.DbPath))
				{
					File.Move(settings.DbPath, $"{settings.DbPath}.old", true);
				}
				File.Delete(settings.DbPath);
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

		private IEnumerable<Club> GetClubsWithStandardizedName()
		{
			var clubs = clubRepository.GetAll();
			foreach (var club in clubs)
				club.Name = FifaService.GetStandardizedClubName(club.Name);
			return clubs;
		}

		private IEnumerable<Player> GetPlayersWithStandardizedCountryName()
		{
			var players = playerRepository.GetAll();
			foreach (var player in players)
				player.Country = FifaService.GetStandardizedCountryName(player.Country);
			return players;
		}

		private IEnumerable<Country> GetCountriesWithStandardizedName()
		{
			var countries = countryRepository.GetAll();
			foreach (var country in countries)
				country.Name = FifaService.GetStandardizedCountryName(country.Name);
			return countries;
		}
	}
}
