using AutoMapper;
using RaffootLoader.Data.Interfaces;
using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Interfaces.Services;
using RaffootLoader.Services.DTO.Response;
using RaffootLoader.Utils;
using System.Text;
using System.Text.Json;

namespace RaffootLoader.Services
{
    public class JsonFileGenerator(ISettings settings, IContext context, IMapper mapper) : IJavaScriptFileGenerator
	{
		private readonly JsonSerializerOptions _jsonSerializerOptions = new()
		{
			PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
			WriteIndented = true,
		};

		public void GenerateFifaServiceFile()
		{
			try
			{
				Console.WriteLine("Generating SoFifaService file...");

				var version = settings.Year.ToString().Substring(2, 2);
				var fileName = $"SoFifa{version}Service";
				var filePath = Path.Combine(settings.BaseFolder, "Raffoot.Application", $"{fileName}.js");

				var json = GetJsonData();

				var sb = new StringBuilder();

				sb.AppendLine(string.Format("class {0} {{", fileName));

				sb.AppendLine("\tstatic getData() {");
				sb.AppendLine("\t\tconst data = ");
				sb.AppendLine(string.Format("`{0}`;", json));
				sb.AppendLine();
				sb.AppendLine("\t\treturn JSON.parse(data);");

				sb.AppendLine("\t}").AppendLine();
				sb.Append('}');

				File.WriteAllText(filePath, sb.ToString());
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}
		}

		private string GetJsonData()
		{
			var json = string.Empty;

			try
			{
				var response = new FootballDataResponseDto
				{
					Continents = Enum.GetValues(typeof(Continent)).Cast<Continent>().Select(c => new ContinentDto { Id = (int)c, Name = c.ToString() }).ToList(),
					Positions = mapper.Map<IList<PositionDto>>(context.Positions)
				};

				foreach (var continentDto in response.Continents)
				{
					continentDto.Countries = mapper.Map<List<CountryDto>>(context.Countries.Where(c => c.Continent == continentDto.Name));

					foreach (var countryDto in continentDto.Countries)
					{
						var leagues = context.Leagues.Where(c => c.Country == countryDto.Name).OrderBy(l => l.Division);

						foreach (var league in leagues)
						{
							var clubs = context.Clubs.Where(c => c.LeagueId == league.ExternalId);

							foreach (var club in clubs)
							{
								var clubDto = mapper.Map<ClubDto>(club);
								clubDto.CountryId = context.Countries.Single(c => c.Name == countryDto.Name).Id;
								clubDto.Colors = new ColorsDto { Background = club.BackgroundColor, Foreground = club.ForegroundColor };
								countryDto.Clubs.Add(clubDto);

								var players = context.Players.Where(p => p.ClubId == club.ExternalId);

								foreach (var player in players)
								{
									var playerDto = mapper.Map<PlayerDto>(player);
									playerDto.CountryId = context.Countries.Single(c => c.Name == player.Country).Id;
									playerDto.PositionId = response.Positions.Single(p => p.Abbreviation == player.Positions.First()).Id;
									clubDto.Players.Add(playerDto);
								}
							}
						}
					}
				}

				json = JsonSerializer.Serialize(response, _jsonSerializerOptions);
			}
			catch (Exception ex)
			{
				ConsoleUtils.ShowException(ex);
			}

			return json;
		}
	}
}
