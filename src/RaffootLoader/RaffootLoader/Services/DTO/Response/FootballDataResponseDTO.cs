namespace RaffootLoader.Services.DTO.Response
{
	public class FootballDataResponseDto
	{
		public IList<PositionDto> Positions { get; set; } = [];
		public IList<ContinentDto> Continents { get; set; } = [];
	}
}
