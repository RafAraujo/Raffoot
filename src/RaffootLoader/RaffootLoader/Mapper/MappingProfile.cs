using AutoMapper;
using RaffootLoader.Domain.Models;
using RaffootLoader.Services.DTO.Response;

namespace RaffootLoader.Mapper
{
	public class MappingProfile : Profile
	{
		public MappingProfile()
		{
			CreateMap<Country, CountryDto>().ReverseMap();
			CreateMap<Club, ClubDto>().ReverseMap();
			CreateMap<Player, PlayerDto>().ReverseMap();
			CreateMap<Position, PositionDto>().ReverseMap();
		}
	}
}
