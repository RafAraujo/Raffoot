class Championship {
    constructor(name, championshipTypeId, countryIds, division, clubCount, internationalCupSpots, confederationName) {
        this.name = name;
        this._championshipTypeId = championshipTypeId;
        this._countryIds = countryIds;
        this.division = division;
        this.clubCount = clubCount;
        this.internationalCupSpots = internationalCupSpots;
        this.confederationName = confederationName;
    }

    static create(name, championshipType, countryIds, division, clubCount, internationalCupSpots, confederationName) {
        const championship = new Championship(name, championshipType.id, countryIds, division, clubCount, internationalCupSpots, confederationName);
        championship.id = Context.game.championships.push(championship);
        championshipType.addChampionship(championship);
        return championship;
    }

    static getById(id) {
        return Context.game.championships[id - 1];
    }

    static seed() {
        const nationalCup = ChampionshipType.find('national', 'cup');
        const nationalLeague = ChampionshipType.find('national', 'league');
        const nationalSupercup = ChampionshipType.find('national', 'supercup');
        const internationalCup = ChampionshipType.find('international', 'cup');
        const internationalSupercup = ChampionshipType.find('international', 'supercup');

        const confederations = [
            { name: 'Argentina', countries: ['Argentina'], cupSpots: 2 },
            { name: 'Brazil', countries: ['Brazil'], cupSpots: 2 },
            { name: 'England', countries: ['England'], cupSpots: 3 },
            { name: 'France', countries: ['France'], cupSpots: 2  },
            { name: 'Germany', countries: ['Germany'], cupSpots: 3 },
            { name: 'Italy', countries: ['Italy'], cupSpots: 3 },
            { name: 'Portugal', countries: ['Portugal'], cupSpots: 2 },
            { name: 'Spain', countries: ['Spain'], cupSpots: 3 },

            { name: 'BeNe', countries: ['Belgium', 'Netherlands'], cupSpots: 2 },
            { name: 'British Isles', countries: ['Republic of Ireland', 'Scotland'], cupSpots: 1 },
            { name: 'Central Europe', countries: ['Austria', 'Czech Republic', 'Switzerland'], cupSpots: 1 },
            { name: 'Eastern Europe', countries: ['Croatia', 'Poland', 'Romania', 'Ukraine'], cupSpots: 1 },
            { name: 'Eurasia', countries: ['Cyprus', 'Greece', 'Turkey'], cupSpots: 1 },
            { name: 'Scandinavia', countries: ['Denmark', 'Finland', 'Norway', 'Sweden'], cupSpots: 1 },
            { name: 'North America', countries: ['Mexico', 'United States'], cupSpots: 2 },
            { name: 'South America', countries: ['Bolivia', 'Colombia', 'Ecuador', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela'], cupSpots: 2 },
            { name: 'Rest of the World', countries: ['Australia', 'China PR', 'India', 'Japan', 'Korea Republic', 'Saudi Arabia', 'South Africa', 'United Arab Emirates'], cupSpots: 1 },
        ];

        for (let confederation of confederations) {
            const countryIds = confederation.countries.map(countryName => Context.game.countries.find(c => c.name === countryName).id);
            const clubs = Context.game.clubs.filter(c => countryIds.some(id => c.country.id === id));
            const cupClubCount = Championship.getCupClubCsount(clubs.length);
            Championship.create(`${confederation.name} Cup`, nationalCup, countryIds, null, cupClubCount, null, null);

            let clubsWithoutDivision = clubs.length;
            let division = 1;
            while (clubsWithoutDivision >= Config.nationalLeague.minClubCount) {
                let clubCount = clubsWithoutDivision >= Config.nationalLeague.maxClubCount ? Config.nationalLeague.maxClubCount : clubsWithoutDivision;
                clubsWithoutDivision -= clubCount;
                Championship.create(`${confederation.name} League ${division}`, nationalLeague, countryIds, division, clubCount, confederation.cupSpots, confederation.name);
                division++;
            }

            Championship.create(`${confederation.name} Supercup`, nationalSupercup, countryIds, null, 2, null, null);
        }

        Championship.create('Champions Cup', internationalCup, null, 1, Config.internationalCup.clubCount, null);
        Championship.create('Conference Cup', internationalCup, null, 2, Config.internationalCup.clubCount, null);
        Championship.create('International Supercup', internationalSupercup, null, null, 2, null, null);
    }

    static getCupClubCsount(clubCount) {
        let count = Config.nationalCup.maxClubCount;
        while (count > clubCount)
            count /= 2;
        return count;
    }

    static getDivisionCount(countries) {
        let clubs = countries.map(c => c.clubs).flat();
        return Math.min(Math.floor(clubs.length / Config.nationalLeague.clubCount), Config.nationalLeague.maxDivisionCount);
    }
    
    get championshipType() {
        return ChampionshipType.getById(this._championshipTypeId);
    }

    get countries() {
        return Context.game.countries.filterByIds(this._countryIds);
    }

    get dateCount() {
        switch (this.championshipType.regulation) {
            case 'groups':
                return this.groupDatesCount + this.getEliminationDatesCount();
            case 'elimination':
                return this.getEliminationDatesCount();
            case 'round-robin':
                return (this.clubCount - 1) * (this.isTwoLeggedTie ? 2 : 1);
            default:
                return 0;
        }
    }

    get groupClubCount() {
        return this.championshipType.regulation === 'groups' ? Config.cup.groupClubCount : null;
    }

    get groupCount() {
        return this.championshipType.regulation === 'groups' ? this.clubCount / Config.cup.groupClubCount : 0;
    }

    get groupDatesCount() {
        return this.championshipType.regulation === 'groups' ? (Config.cup.groupClubCount - 1) * (this.isTwoLeggedTie ? 2 : 1) : 0;
    }

    get importance() {
        switch (this.championshipType.scope) {
            case 'international':
                return this.division === 1 ? 16 : 8;
            case 'national':
                return this.championshipType.regulation === 'cup' ? 3 : 5 - this.division;
            default:
                return 0;
        }
    }

    get qualifiedClubsByGroupCount() {
        return Config.cup.groupQualifiedClubCount;
    }

    get isTwoLeggedTie() {
        return this.championshipType.isTwoLeggedTie;
    }

    getEliminationDatesCount() {
        switch (this.championshipType.regulation) {
            case 'groups':
                return genericEliminationDatesCount(Config.cup.groupClubCount * Config.cup.groupQualifiedClubCount, this.isTwoLeggedTie);
            case 'elimination':
                return genericEliminationDatesCount(this.clubCount, this.isTwoLeggedTie);
            default:
                return 0;
        }

        function genericEliminationDatesCount(clubCount, isTwoLeggedTie) {
            return Math.log2(clubCount) * (isTwoLeggedTie ? 2 : 1);
        }
    }
}