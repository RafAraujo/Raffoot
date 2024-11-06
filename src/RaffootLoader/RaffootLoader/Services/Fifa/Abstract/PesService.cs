using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Models;

namespace RaffootLoader.Services.Fifa.Abstract
{
    public abstract class PesService
    {
		protected static readonly int RestOfWorldLeagueId = 76;

		protected static List<League> GetLeagues()
        {
            var leagues = new League[]
            {
                new(21, "Brazil", 1, Continent.America),
			};

            return [.. leagues];
        }

		protected static string GetStandardizedClubName(string club)
		{
			return club switch
			{
				"AC Goianiense" or "Atlético Go" => "Atlético GO",
				"Atlético PR" or "CA Paranaense" => "Atlético Paranaense",
				"Avai FC" => "Avaí",
				"Botafogo FR" => "Botafogo",
				"Chapecoense AF" => "Chapecoense",
				"Coritiba FBC" => "Coritiba",
				"CR Flamengo" or "C.R. Flamengo" => "Flamengo",
				"CR Vasco da Gama" => "Vasco da Gama",
				"Cruzeiro EC" => "Cruzeiro",
				"EC Bahia" or "EC Bahía" => "Bahia",
				"EC Vitória" or "E.C. Vitória" => "Vitória",
				"Figueirense FC" => "Figueirense",
				"Fluminense FC" or "Fluminense F.C." => "Fluminense",
				"Red Bull Bragantino" => "Bragantino",
				"Santa Cruz FC" => "Santa Cruz",
				"Santos FC" or "Santos F.C." or "Santos FC Sao Paulo" => "Santos",
				"São Paulo FC" => "São Paulo",
				"SC Corinthians" or "SC Corinthians Paulista" => "Corinthians",
				"SC Do Recife" => "Sport Recife",
				"SC Internacional" => "Internacional",
				_ => club,
			};
		}

		protected static string GetStandardizedCountryName(string country)
		{
			return country switch
			{
				"Czech Republic" => "Czechia",
				"Ivory Coast" => "Côte d'Ivoire",
				"Serbia and Montenegro" => "Serbia",
				"South Korea" => "Korea Republic",
				"Turkey" => "Türkiye",
				"USA" => "United States",
				_ => country,
			};
		}

		public static string GetStandardizedPositionAbbreviation(string position)
		{
			return position switch
			{
				"DMF" => "CDM",
				"CMF" => "CM",
				"LMF" => "LM",
				"RMF" => "RM",
				"AMF" => "CAM",
				"LWF" => "LW",
				"RWF" => "RW",
				"SS" => "CF",
				"CF" => "ST",
				_ => position,
			};
		}
	}
}
