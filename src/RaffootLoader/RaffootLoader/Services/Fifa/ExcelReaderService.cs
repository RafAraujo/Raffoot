using ExcelDataReader;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.Abstract;
using RaffootLoader.Services.DTO;
using System.Data;
using System.Text;

namespace RaffootLoader.Services.Fifa
{
    // https://www.soccergaming.com/index.php?threads/fifa-dbs-since-fifa-98-download.6469756/
    public class ExcelReaderService(ISettings settings) : FifaService, IDataExtractorService
	{
		private List<Country> countries = [];

		public async Task<DatabaseDto> GetDatabase()
		{
			var database = new DatabaseDto();

			var ds = ReadFile();
			var leagues = GetLeagues(ds);
			var clubs = GetClubs(ds, leagues);
			var players = GetPlayers(ds, clubs);

			countries = [.. countries.OrderBy(c => c.Name)];

			var team = players.Where(p => p.ClubId == 44).ToList();

			database.Year = settings.Year;
			database.Leagues = leagues;
			database.Clubs = clubs;
			database.Players = players;
			database.Countries = countries;

			return await Task.FromResult(database);
		}

		private DataSet ReadFile()
		{
			var fileName = $"Fifa {settings.Year.ToString()[2..]}";
			var filePath = Path.Combine(settings.ConsoleAppFolder, "Resources", fileName, $"{fileName}.xlsx");

			Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

			using var stream = File.Open(filePath, FileMode.Open, FileAccess.Read);
			using var reader = ExcelReaderFactory.CreateReader(stream);
			var configuration = new ExcelDataSetConfiguration
			{
				ConfigureDataTable = _ => new ExcelDataTableConfiguration()
				{
					UseHeaderRow = true
				}
			};
			var ds = reader.AsDataSet(configuration);
			return ds;
		}

		private static List<League> GetLeagues(DataSet ds)
		{
			var leagues = new List<League>();

			var dt = ds.Tables["leagues"];

			foreach (DataRow row in dt.Rows)
			{
				var country = row["country"].ToString();

				if (string.IsNullOrEmpty(country))
					continue;

				Continent? continent = null;
				if (Enum.TryParse(row["continent"].ToString(), out Continent value))
					continent = value;

				var league = new League(int.Parse(row["leagueid"].ToString()), country, int.Parse(row["division"].ToString()), continent);
				leagues.Add(league);
			}

			return leagues;
		}

		private static List<Club> GetClubs(DataSet ds, List<League> leagues)
		{
			var clubs = new List<Club>();

			var dt = ds.Tables["teams"];

			foreach (DataRow row in dt.Rows)
			{
				var club = new Club
				{
					ExternalId = int.Parse(row["teamid"].ToString()),
					Name = row["teamnamefull"].ToString(),
				};
				clubs.Add(club);
			}

			dt = ds.Tables["leagueteamlinks"];

			foreach (DataRow row in dt.Rows)
			{
				var leagueId = int.Parse(row["leagueid"].ToString());

				var club = clubs.Single(c => c.ExternalId == int.Parse(row["teamid"].ToString()));
				club.LeagueId = leagueId;

				if (!leagues.Any(l => l.ExternalId == leagueId))
					clubs.Remove(club);
			}

			return clubs;
		}

		private List<Player> GetPlayers(DataSet ds, List<Club> clubs)
		{
			var players = new List<Player>();

			var dt = ds.Tables["players"];

			foreach (DataRow row in dt.Rows)
			{
				var position = GetPosition(int.Parse(row["preferredposition1"].ToString()));

				var positions = new List<string>
				{
					position.Item2
				};

				for (var i = 2; i < 4; i++)
					if (int.TryParse(row[$"preferredposition{i}"].ToString(), out int positionId) && positionId >= 0)
						positions.Add(GetPosition(positionId).Item2);

				var birthDate = int.Parse(row["birthdate"].ToString());
				var age = settings.Year == 2004 ? CalculateAge(birthDate) : birthDate;

				var overall = CalculateOverall(position.Item3, row);

				var player = new Player
				{
					ExternalId = int.Parse(row["playerid"].ToString()),
					Name = row["surname"].ToString(),
					FullName = string.IsNullOrEmpty(row["firstname"].ToString()) ? row["surname"].ToString() : $"{row["firstname"]} {row["surname"]}",
					Age = age,
					Positions = positions,
					Overall = overall,
					Potential = overall,
				};
				players.Add(player);
			}

			dt = ds.Tables["teamplayerlinks"];

			foreach (DataRow row in dt.Rows)
			{
				var clubId = int.Parse(row["teamid"].ToString());

				if (!clubs.Any(c => c.ExternalId == clubId))
					continue;

				var player = players.Single(c => c.ExternalId == int.Parse(row["playerid"].ToString()));
				player.ClubId = clubId;
			}

			return players;
		}

		private static int CalculateAge(int days)
		{
			var baseDate = new DateTime(1582, 10, 14);
			var birthDate = baseDate.AddDays(days);
			var releaseDate = new DateTime(2003, 10, 24);

			var age = releaseDate.Year - birthDate.Year;
			if (releaseDate.Month < birthDate.Month || (releaseDate.Month == birthDate.Month && releaseDate.Day < birthDate.Day))
				age--;

			return age;
		}

		// https://gamefaqs.gamespot.com/ps2/914855-fifa-soccer-2004/faqs/28724
		private static int CalculateOverall(FieldRegion fieldRegion, DataRow row)
		{
			var surname = row["surname"].ToString();

			if (surname == "Córdoba")
			{

			}

			var factors = new List<Tuple<FieldRegion, List<Tuple<string, double>>>>
			{
				new(FieldRegion.Goal, [new("reflexes", 0.4), new("handling", 0.4), new("rushing", 0.2)]),
				new(FieldRegion.Defense, [new("tackling", 0.3), new("marking", 0.3), new("heading", 0.2), new("ballcontrol", 0.1), new("longballs", 0.1)]),
				new(FieldRegion.Midfield, [new("passing", 0.3), new("ballcontrol", 0.2), new("tackling", 0.2), new("longballs", 0.1), new("dribbling", 0.1), new("heading", 0.1)]),
				new(FieldRegion.Attack, [new("shotaccuracy", 0.3), new("shotpower", 0.3), new("heading", 0.2), new("ballcontrol", 0.1), new("dribbling", 0.1)]),
			};

			var fieldRegionFactors = factors.Single(f => f.Item1 == fieldRegion);

			var overall = fieldRegionFactors.Item2.Sum(f => double.Parse(row[f.Item1].ToString()) * f.Item2);

			return (int)Math.Floor(overall);
		}

		private static Tuple<string, string, FieldRegion> GetPosition(int positionId)
		{
			var positions = new List<Tuple<string, string, FieldRegion>>()
			{
				new("Goalkeeper", "GK", FieldRegion.Goal),

				new("Sweeper", "CB", FieldRegion.Defense),
				new("Right Wing Back", "RB", FieldRegion.Defense),
				new("Right Back", "RB", FieldRegion.Defense),
				new("Right Centre Back", "CB", FieldRegion.Defense),
				new("Centre Back", "CB", FieldRegion.Defense),
				new("Left Centre Back", "CB", FieldRegion.Defense),
				new("Left Back", "LB", FieldRegion.Defense),
				new("Left Wing Back", "LB", FieldRegion.Defense),

				new("Right Def. Midfield", "RWB", FieldRegion.Midfield),
				new("Right Centre Def. Midfield", "CDM", FieldRegion.Midfield),
				new("Centre Def. Midfield", "CDM", FieldRegion.Midfield),
				new("Left Centre Def. Midfield", "CDM", FieldRegion.Midfield),
				new("Left Def. Midfield", "LWB", FieldRegion.Midfield),
				new("Right Wing Midfield", "RM", FieldRegion.Midfield),
				new("Right Midfield", "RM", FieldRegion.Midfield),
				new("Right Centre Midfield", "CM", FieldRegion.Midfield),
				new("Centre Midfield", "CM", FieldRegion.Midfield),
				new("Left Centre Midfield", "CM", FieldRegion.Midfield),
				new("Left Midfield", "LM", FieldRegion.Midfield),
				new("Left Wing Midfield", "LM", FieldRegion.Midfield),
				new("Right Att. Midfield", "RW", FieldRegion.Midfield),
				new("Right Centre Att. Midfield", "CAM", FieldRegion.Midfield),
				new("Centre Att. Midfield", "CAM", FieldRegion.Midfield),
				new("Left Centre Att. Midfield", "CAM", FieldRegion.Midfield),
				new("Left Att. Midfield", "LW", FieldRegion.Midfield),

				new("Right Forward", "CF", FieldRegion.Attack),
				new("Centre Forward", "CF", FieldRegion.Attack),
				new("Left Forward", "CF", FieldRegion.Attack),
				new("Right Striker", "ST", FieldRegion.Attack),
				new("Striker", "ST", FieldRegion.Attack),
				new("Left Striker", "ST", FieldRegion.Attack),
			};

			var position = positions[positionId];
			return position;
		}
	}
}
