class Championship {
    constructor(name, championshipTypeId, continentId, confederationId, division, clubCount) {
        this.name = name;
        this._championshipTypeId = championshipTypeId;
        this._continentId = continentId;
        this._confederationId = confederationId;
        this.division = division;
        this.clubCount = clubCount;
    }

    static create(name, championshipType, continentId, confederationId, division, clubCount) {
        const championship = new Championship(name, championshipType.id, continentId, confederationId, division, clubCount);
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
        const continentalCup = ChampionshipType.find('continental', 'cup');
        const continentalSupercup = ChampionshipType.find('continental', 'supercup');
        const worldCup = ChampionshipType.find('world', 'cup');

        const confederations = Context.game.confederations;

        for (let confederation of confederations) {
            const countryIds = confederation.countries.map(c => Country.getByName(c.name)).map(c => c.id);
            const clubs = Context.game.clubs.filter(c => countryIds.some(id => c.country.id === id));
            const cupClubCount = Championship.getCupClubCount(clubs.length);
            Championship.create(`${confederation.name} Cup`, nationalCup, null, confederation.id, 1, cupClubCount);

            let clubsWithoutDivision = clubs.length;
            let division = 1;
            while (clubsWithoutDivision >= Config.nationalLeague.minClubCount) {
                const clubCount = clubsWithoutDivision >= Config.nationalLeague.maxClubCount ? Config.nationalLeague.maxClubCount : clubsWithoutDivision;
                clubsWithoutDivision -= clubCount;
                Championship.create(`${confederation.name} League ${division}`, nationalLeague, null, confederation.id, division, clubCount);
                division++;
            }

            Championship.create(`${confederation.name} Supercup`, nationalSupercup, countryIds, 1, 2);
        }

        const continents = Context.game.continents.filter(con => con.countries.flatMap(c => c.clubs).length > 0);

        for (let continent of continents) {
            for (let division = 1; division <= 2; division++) {
                Championship.create(continent.getContinentalCupName(division), continentalCup, continent.id, null, division, continent.getContinentalCupSpots(division));
            }
            Championship.create(`${continent.name} Supercup`, continentalSupercup, null, null, 1, 2);
        }

        Championship.create('World Cup', worldCup, null, null, 1, 2);
    }

    static getCupClubCount(clubCount) {
        let count = Config.nationalCup.maxClubCount;
        while (count > clubCount) {
            count /= 2;
        }
        return count;
    }
    
    get championshipType() {
        return ChampionshipType.getById(this._championshipTypeId);
    }

    get confederation() {
        return Confederation.getById(this._confederationId);
    }

    get continent() {
        return Continent.getById(this._continentId);
    }

    get countries() {
        return this.confederation.countries;
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
            case 'world':
                return 12;
            case 'continental':
                return this.division === 1 ? 16 : 8;
            case 'national':
                return this.championshipType.regulation === 'cup' ? 5 : 6 - this.division;
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

    getDateCount() {
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