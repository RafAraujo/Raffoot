namespace RaffootLoader.Services.DTO.Response
{
	public class ContinentDto
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public IList<CountryDto> Countries { get; set; }
	}
}
