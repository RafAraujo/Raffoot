using RaffootLoader.Domain.Enums;
using RaffootLoader.Domain.Models;

namespace RaffootLoader.Application.Services.Abstract
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
                "North London" or "Arsenal FC" => "Arsenal",
                "West Midlands Village" or "Aston Villa FC" => "Aston Villa",
                "West Midlands City" => "Birmingham City",
                "Lancashire" or "Blackburn Rovers FC" => "Blackburn Rovers",
                "Middlebrook" => "Bolton Wanderers",
                "South East London" => "Charlton Athletic",
                "West London Blue" or "Chelsea FC" => "Chelsea",
                "Crisisbless" => "Crystal Palace",
                "Merseyside Blue" or "Everton FC" => "Everton",
                "West London White" or "Fulham FCICT" => "Fulham",
                "Merseyside Red" or "Liverpool FC" => "Liverpool",
                "Man Blue" or "Manchester City FC" => "Manchester City",
                "Man Red" or "Manchester United FC" => "Manchester United",
                "Teesside" => "Middlesbrough",
                "Tyneside" or "Newcastle FC" => "Newcastle United",
                "Northluck C" => "Norwich City",
                "Pompy" => "Portsmouth",
                "Soton" => "Southampton",
                "North East London" or "Tottenham Hotspur FC" => "Tottenham Hotspur",
                "Nextbaumedge" => "West Bromwich Albion",
                "Leeds United FC" => "Leeds United",
                "West Ham United FC" => "West Ham United",

                "Corse Sud" => "Ajaccio",
                "Azur" or "AS Monaco" => "Monaco",
                "Bourgogne" or "AJ Auxerre" => "Auxerre",
                "Haute Corse" => "Bastia",
                "Aquitaine" or "FC Girondins Bordeaux" => "Bordeaux",
                "Kalm" => "Caen",
                "Equpris" => "Istres",
                "Pas de Calais" => "LOSC Lille",
                "Rhone" => "Olympique Lyonnais",
                "Moselle" => "Metz",
                "Loire Océan" => "Nantes",
                "Alpes Maritimes" => "Nice",
                "Bouches du Rhone" or "Olympique Marseille" => "Olympique de Marseille",
                "Ile De France" or "Paris Saint-Germain FC" => "Paris Saint Germain",
                "Nord" or "RC Lens" => "Lens",
                "Bretagne" => "Rennes",
                "Somesterrine" => "Saint-Étienne",
                "Franche-Comté" => "Sochaux",
                "Alsace" => "Strasbourg",
                "Garonne" => "Toulouse",

                "Wizland" or "Wilzand" => "DSC Arminia Bielefeld",
                "Rhein" => "Bayer 04 Leverkusen",
                "Rekordmeister" or "FC Bayern Munchen" => "FC Bayern München",
                "Pott VfL" or "Pott" => "VfL Bochum 1848",
                "Westfalen" => "Borussia Dortmund",
                "Fohlen" => "Borussia Mönchengladbach",
                "Breisgau" => "SC Freiburg",
                "Hanseaten" => "Hamburger SV",
                "Niedersachsen" => "Hannover 96",
                "Mecklenburg" => "Hansa Rostock",
                "Haupstadt" => "Hertha BSC",
                "Pfalz" => "Kaiserslautern",
                "Naunz" => "Mainz 05",
                "Mulenbalok" => "Nürnberg",
                "Ruhr" or "FC Schalke 04" => "Schalke 04",
                "Neckar" => "VfB Stuttgart",
                "Autostadt" => "VfL Wolfsburg",
                "Weser" or "SC Werder Bremen" => "Werder Bremen",

                "Patagonia" or "CA Boca Juniors" => "Boca Juniors",
                "Pampas" or "CA River Plate" => "River Plate",
                "FC Belgium" => "Club Brugge",
                "Bruxelles" or "RSC Anderlecht" => "Anderlecht",
                "Belo Horizonte" => "Cruzeiro",
                "Praha" or "AC Sparta Praha" => "Sparta Praha",
                "AC Greek" => "AEK Athens",
                "Peloponnisos" or "Olympiacos FC" => "Olympiakos Piraeus",
                "Athenakos" or "Athenakos FC" or "Panathinaikos FC" => "Panathinaikos",
                "Lisbonera" or "SL Benfica" => "Benfica",
                "Puerto" or "FC Porto" => "Porto",
                "Esportiva" => "Sporting CP",
                "L.Mossubann" or "Russia Rail FC" => "Lokomotiv Moskva",
                "Valdai" or "FC Spartak Moscow" => "Spartak Moskva",
                "Old Firm Green" or "Celtic FC" => "Celtic",
                "Old Firm Blue" or "Rangers FCgers" => "Rangers",
                "Balvidan" => "Partizan",
                "Bejutassle" or "FC Bosphorus" => "Beşiktaş",
                "Byzantinobul" or "Galatasaray SK" => "Galatasaray",
                "Constanti" or "Constantinahce" or "Fenerbahce SK" => "Fenerbahçe",
                "Marmara" or "Dynamo Kiev" => "Dynamo Kyiv",

                "AC Milan" or "A.C. Milan" => "Milan",
                "AC Perugia" => "Perugia",
                "AS Chievo Verona" => "Chievo",
                "AS Roma" or "A.S. Roma" => "Roma",
                "Bologna FCL" => "Bologna",
                "Brescia Calcio" => "Brescia",
                "FC Internazionale" => "Inter",
                "Juventus FC" => "Juventus",
                "Messina" => "ACR Messina",
                "Parma Calcio" => "Parma",
                "SS Lazio" => "Lazio",
                "Udinese Calcio" => "Udinese",

                "Albacete B." => "Albacete",
                "Atletico Madrid" or "C. At. Madrid" => "Atlético Madrid",
                "F.C. Barcelona" => "FC Barcelona",
                "RC Celta Vigo" => "Celta de Vigo",
                "RC DeportivoCoruna" or "R.C. Deportivo" => "Deportivo La Coruña",
                "R.C.D. Espanyol" => "Espanyol",
                "Getafe C.F." => "Getafe",
                "Levante U.D." => "Levante",
                "Málaga C.F." => "Málaga",
                "R.C.D. Mallorca" => "Mallorca",
                "C.D. Numancia" => "Numancia",
                "At. Osasuna" => "Osasuna",
                "R. Racing C." => "Racing Santander",
                "Real Betislia" or "R. Betis" => "Real Betis",
                "Real Madrid CF" or "R. Madrid" => "Real Madrid",
                "R. Sociedad" => "Real Sociedad",
                "R. Zaragoza" => "Real Zaragoza",
                "Sevilla F.C." => "Sevilla",
                "Valencia CF" or "Valencia C.F." => "Valencia",
                "Villarreal C.F." => "Villarreal",

                "Ado den Haag" => "ADO Den Haag",
                "AFC Ajax" => "Ajax",
                "AZ" => "AZ Alkmaar",
                "Feyenoord Rotterdam" => "Feyenoord",
                "NEC Nijmegen" => "NEC",
                "PSV Eindhoven" => "PSV",
                "Roda JC" => "Roda JC Kerkrade",

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
                "China" => "China PR",
                "Congo the DR" => "Congo DR",
                "Czech Republic" => "Czechia",
                "Ireland" => "Republic of Ireland",
                "Ivory Coast" => "Côte d'Ivoire",
                "Macedonia" => "North Macedonia",
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
