namespace RaffootLoader.Services.DTO.Response
{
	public class CountryDto
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public int? ContinentId { get; set; }
		public IList<ClubDto> Clubs { get; set; } = [];
	}
}
