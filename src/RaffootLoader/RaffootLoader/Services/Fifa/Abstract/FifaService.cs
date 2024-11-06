using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Models;

namespace RaffootLoader.Services.Fifa.Abstract
{
    public abstract class FifaService
    {
		protected static readonly int RestOfWorldLeagueId = 76;

		protected static List<League> GetLeagues()
        {
            var leagues = new League[]
            {
                new(347, "South Africa", 1, Continent.Africa),

                new(353, "Argentina", 1, Continent.America),
                new(2017, "Bolivia", 1, Continent.America),
                new(7, "Brazil", 1, Continent.America),
                new(335, "Chile", 1, Continent.America),
                new(336, "Colombia", 1, Continent.America),
                new(2018, "Ecuador", 1, Continent.America),
                new(39, "United States", 1, Continent.America),
                new(338, "Uruguay", 1, Continent.America),
                new(2019, "Venezuela", 1, Continent.America),
                new(341, "Mexico", 1, Continent.America),
                new(337, "Paraguay", 1, Continent.America),
                new(2020, "Peru", 1, Continent.America),

                new(351, "Australia", 1, Continent.Asia),
                new(2012, "China PR", 1, Continent.Asia),
                new(2149, "India", 1, Continent.Asia),
                new(349, "Japan", 1, Continent.Asia),
                new(83, "Korea Republic", 1, Continent.Asia),
                new(350, "Saudi Arabia", 1, Continent.Asia),
                new(2013, "United Arab Emirates", 1, Continent.Asia),

                new(80, "Austria", 1, Continent.Europe),
                new(4, "Belgium", 1, Continent.Europe),
                new(317, "Croatia", 1, Continent.Europe),
                new(318, "Cyprus", 1, Continent.Europe),
                new(319, "Czechia", 1, Continent.Europe),
                new(1, "Denmark", 1, Continent.Europe),
                new(13, "England", 1, Continent.Europe),
                new(14, "England", 2, Continent.Europe),
                new(60, "England", 3, Continent.Europe),
                new(61, "England", 4, Continent.Europe),
                new(62, "England", 5, Continent.Europe),
                new(322, "Finland", 1, Continent.Europe),
                new(16, "France", 1, Continent.Europe),
                new(17, "France", 2, Continent.Europe),
                new(19, "Germany", 1, Continent.Europe),
                new(20, "Germany", 2, Continent.Europe),
                new(2076, "Germany", 3, Continent.Europe),
                new(63, "Greece", 1, Continent.Europe),
                new(64, "Hungary", 1, Continent.Europe),
                new(31, "Italy", 1, Continent.Europe),
                new(32, "Italy", 2, Continent.Europe),
                new(10, "Netherlands", 1, Continent.Europe),
                new(41, "Norway", 1, Continent.Europe),
                new(66, "Poland", 1, Continent.Europe),
                new(308, "Portugal", 1, Continent.Europe),
                new(65, "Republic of Ireland", 1, Continent.Europe),
                new(330, "Romania", 1, Continent.Europe),
                new(67, "Russia", 1, Continent.Europe),
                new(50, "Scotland", 1, Continent.Europe),
                new(53, "Spain", 1, Continent.Europe),
                new(54, "Spain", 2, Continent.Europe),
                new(56, "Sweden", 1, Continent.Europe),
                new(189, "Switzerland", 1, Continent.Europe),
                new(68, "Türkiye", 1, Continent.Europe),
                new(332, "Ukraine", 1, Continent.Europe),

				new(76, "Rest of World", 1, null),
			};

            foreach (var group in leagues.GroupBy(l => l.ExternalId))
                if (group.Count() > 1)
                    throw new Exception();

            return [.. leagues];
        }

		protected static string GetCountryForRestOfWorldClub(string clubName)
		{
			var tuples = new List<Tuple<string, string>>
		    {
			    new("Argentina", "Boca Juniors"),
			    new("Argentina", "River Plate"),

			    new("Czechia", "AC Sparta Prague"),
			    new("Czechia", "AC Sparta Praha"),
			    new("Czechia", "Sigma Olomouc"),

			    new("Greece", "Olympiakos"),
			    new("Greece", "Panathinaikos"),
			    new("Greece", "Paniliakos"),
                new("Greece", "Paok"),
			    new("Greece", "Thessaloniki"),

                new("Poland", "Legia Warsaw"),
                new("Poland", "Polonia Warszawa"),
                new("Poland", "Wisla Krakow"),

			    new("South Africa", "Kaizer Chiefs"),
			    new("South Africa", "Orlando Pirates"),

			    new("Türkiye", "Fenerbahçe SK"),
			    new("Türkiye", "Galatasaray SK"),

			    new("Ukraine", "Shakhtar Donetsk"),
		    };

            var tuple = tuples.Single(t => t.Item2 == clubName);
			return tuple.Item1;
		}

		protected static string GetStandardizedClubName(string club)
		{
			return club switch
			{
				"Atletico Paranaense" => "Atlético Paranaense",
				"Esporte Clube Bahia" => "Bahia",
				"Gremio" => "Grêmio",
				"Vasco Da Gama" => "Vasco da Gama",
				"Vitoria" => "Vitória",

				"AC Milan" => "Milan",
				"AS Roma" => "Roma",
				"Atalanta BC" => "Atalanta",
				"Bari" => "Bari 1908",
				"Chievo Verona" => "Chievo",
				"Doria" => "Sampdoria",
				"Firenze" => "Fiorentina",
				"Inter Milan" => "Inter",
				"Messina" => "ACR Messina",
				"Reggina Calcio" => "Reggina",
				_ => club,
			};
		}

		protected static string GetStandardizedCountryName(string country)
		{
			return country switch
			{
				"Bosnia & Herzegovina" => "Bosnia and Herzegovina",
				"Cape Verde" => "Cabo Verde",
                "Czech Republic" => "Czechia",
				"Central African Rep." => "Central African Republic",
				"DR Congo" => "Congo DR",
				"Guinea Bissau" => "Guinea-Bissau",
				"Ivory Coast" => "Côte d'Ivoire",
				"São Tomé & Príncipe" => "São Tomé and Príncipe",
				"St Kitts Nevis" => "Saint Kitts and Nevis",
				"St Vincent Grenadine" => "Saint Vincent and the Grenadines",
				"Trinidad & Tobago" => "Trinidad and Tobago",
                "Turkey" => "Türkiye",
				_ => country,
			};
		}

		protected static string GetStandardizedPositionAbbreviation(string position)
		{
			return position switch
			{
				"LCB" or "RCB" or "SW" => "CB",
				"LDM" or "LCDM" or "RDM" or "RCDM" => "CDM",
				"LCM" or "RCM" => "CM",
				"LAM" or "LCAM" or "RAM" or "RCAM" => "CAM",
				"LWM" => "LW",
				"RWM" => "RW",
				"LS" or "RS" => "ST",
				"LF" or "RF" => "CF",
				_ => position,
			};
		}

		protected static string GetShortClubName(string clubName)
		{
			return clubName switch
			{
				"Barcelona Guayaquil" => "Barcelona SC",
				"Bayer 04 Leverkusen" => "Bayer Leverkusen",
				"Borussia Mönchengladbach" => "B. M'gladbach",
				"Borussia Dortmund" => "B. Dortmund",
				"Borussia Dortmund II" => "B. Dortmund II",
				"Brighton & Hove Albion" => "Brighton",
				"Cangzhou Mighty Lions" => "Mighty Lions",
				"Chengdu Rongcheng" => "Rongcheng",
				"CSM Politehnica Iași" => "Politehnica Iași",
				"DSC Arminia Bielefeld" => "Arminia Bielefeld",
				"Eintracht Braunschweig" => "E. Braunschweig",
				"FC Bayern München" => "Bayern München",
				"Forest Green Rovers" => "Forest Green",
				"Independiente del Valle" => "I. del Valle",
				"Independiente Medellín" => "I. Medellín",
				"Jagiellonia Białystok" => "Jagiellonia",
				"Milton Keynes Dons" => "MK Dons",
				"Northampton Town" => "Northampton",
				"Olympique de Marseille" => "Marseille",
				"Olympique Lyonnais" => "Lyon",
				"Paris Saint Germain" => "PSG",
				"Peterborough United" => "Peterborough",
				"Puszcza Niepołomice" => "Puszcza",
				"Queens Park Rangers" => "QPR",
				"Raków Częstochowa" => "Raków",
				"San Jose Earthquakes" => "SJ Earthquakes",
				"Sheffield Wednesday" => "Sheffield Wed.",
				"SpVgg Greuther Fürth" => "Greuther Fürth",
				"Tianjin Jinmen Tiger" => "Jinmen Tiger",
				"Técnico Universitario" => "T. Universitario",
				"Tottenham Hotspur" => "Tottenham",
				"Union Saint-Gilloise" => "Union SG",
				"Universidad Católica" => "U. Católica",
				"Universitatea Craiova" => "U. Craiova",
				"Vancouver Whitecaps" => "Whitecaps",
				"Waldhof Mannheim" => "Waldhof 07",
				"West Bromwich Albion" => "West Brom",
				"Wolverhampton Wanderers" => "Wolverhampton",
				"Wuhan Three Towns" => "Three Towns",
				"Wycombe Wanderers" => "Wycombe",
				_ => null,
			};
		}
	}
}
