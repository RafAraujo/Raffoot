namespace RaffootLoader.Services.DTO.Response
{
	public class ClubDto
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public int CountryId { get; set; }
		public ColorsDto Colors { get; set; }
		public int ExternalId { get; set; }
		public IList<PlayerDto> Players { get; set; } = [];
	}
}
