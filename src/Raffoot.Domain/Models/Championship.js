class Championship {
    constructor(name, championshipTypeId, regulation, continentId, confederationId, division, clubCount) {
        this.name = name;
        this._championshipTypeId = championshipTypeId;
        this.regulation = regulation;
        this._continentId = continentId;
        this._confederationId = confederationId;
        this.division = division;
        this.clubCount = clubCount;
        this.promotionClubCount = 0;
        this.relegationClubCount = 0;
    }

    static create(name, championshipType, regulation, continentId, confederationId, division, clubCount) {
        const championship = new Championship(name, championshipType.id, regulation, continentId, confederationId, division, clubCount);
        championship.id = Context.game.championships.push(championship);
        
        championshipType.addChampionship(championship);
        
        return championship;
    }

    static getById(id) {
        return Context.game.championships[id - 1];
    }

    static seed(isFantasyMode) {
        const nationalCup = ChampionshipType.find('national', 'cup');
        const nationalLeague = ChampionshipType.find('national', 'league');
        const nationalSupercup = ChampionshipType.find('national', 'supercup');
        const continentalCup = ChampionshipType.find('continental', 'cup');
        const continentalSupercup = ChampionshipType.find('continental', 'supercup');
        const worldCup = ChampionshipType.find('world', 'cup');

        const confederations = Confederation.all().filter(c => c.isPlayable);

        for (const confederation of confederations) {
            const countryIds = confederation.countries.map(c => c.id);
            const clubs = Context.game.clubs.filter(c => c.isPlayable && countryIds.some(id => c.country.id === id));
            const cupClubCount = Championship.getCupClubCount(clubs.length);
            Championship.create(`${confederation.name} Cup`, nationalCup, 'elimination', null, confederation.id, 1, cupClubCount);

            let clubsWithoutDivision = clubs.length;
            let division = 1;
            while (clubsWithoutDivision >= Config.championship.league.national.minClubCount) {
                const clubCount = clubsWithoutDivision >= Config.championship.league.national.maxClubCount ? Config.championship.league.national.maxClubCount : clubsWithoutDivision;
                clubsWithoutDivision -= clubCount;
                Championship.create(`${confederation.name} League ${division}`, nationalLeague, 'round-robin', null, confederation.id, division, clubCount);
                division++;
            }

            Championship.create(`${confederation.name} Supercup`, nationalSupercup, 'elimination', null, confederation.id, 1, 2);
        }

        if (isFantasyMode)
            return;

        const continents = Continent.all().filter(c => c.clubs.length > 16);

        for (const continent of continents) {
            for (let division = 1; division <= 2; division++) {
                const name = continent.getCupName(division);
                const regulation = continent.getCupRegulation(division);
                const clubCount = regulation === 'league then elimination' ? 36 : continent.confederations.length > 6 ? 32 : 16;
                Championship.create(name, continentalCup, regulation, continent.id, null, division, clubCount);
            }
            Championship.create(`${continent.name} Supercup`, continentalSupercup, 'elimination', continent.id, null, 1, 2);
        }

        Championship.create('World Cup', worldCup, 'elimination', null, null, 1, 2);
    }

    static getCupClubCount(clubCount) {
        let count = Config.championship.cup.national.maxClubCount;
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

    get divisionLetter() {
        return `ABCDEFGHIJKLMNOPQRSTUVWXYZ'${[this.division - 1]}`;
    }

    get groupClubCount() {
        return this.regulation === 'groups' ? Config.championship.cup.group.clubCount : null;
    }

    get groupCount() {
        return this.regulation === 'groups' ? this.clubCount / Config.championship.cup.group.clubCount : 0;
    }

    get importance() {
        switch (this.championshipType.scope) {
            case 'world':
                return 12;
            case 'continental':
                return this.division === 1 ? 16 : 6;
            case 'national':
                if (this.championshipType.format === 'cup')
                    return 8;
                return this.division === 1 ? 10 : 6 - this.division;
            default:
                return 0;
        }
    }

    get isNationalCup() {
        const nationalLeague = ChampionshipType.find('national', 'cup');
        return this._championshipTypeId === nationalLeague.id;
    }

    get isNationalLeague() {
        const nationalLeague = ChampionshipType.find('national', 'league');
        return this._championshipTypeId === nationalLeague.id;
    }

    get maxClubCountForPromotion() {
        return this.isNationalLeague ? Math.round(this.clubCount * Config.championship.league.national.promotionAndRelegationPercentage) : 0;
    }

    get maxClubCountForRelegation() {
        return this.isNationalLeague ? Math.round(this.clubCount * Config.championship.league.national.promotionAndRelegationPercentage) : 0;
    }

    get qualifiedClubsByGroupCount() {
        return Config.championship.cup.group.qualifiedClubCount;
    }

    get isTwoLeggedTie() {
        return this.championshipType.isTwoLeggedTie;
    }

    getDateCount() {
        switch (this.regulation) {
            case 'groups':
                return this.getGroupDateCount() + this.getEliminationDateCount();
            case 'elimination':
                return this.getEliminationDateCount();
            case 'league then elimination':
                return 8 + 2 + this.getEliminationDateCount();
            case 'round-robin':
                return (this.clubCount - 1) * (this.isTwoLeggedTie ? 2 : 1);
            default:
                return 0;
        }
    }

    getEliminationDateCount() {
        switch (this.regulation) {
            case 'groups':
                return _genericEliminationDateCount(Config.championship.cup.groupCount * Config.championship.cup.group.qualifiedClubCount, this.isTwoLeggedTie);
            case 'elimination':
                return _genericEliminationDateCount(this.clubCount, this.isTwoLeggedTie);
            case 'league then elimination':
                return _genericEliminationDateCount(16, this.isTwoLeggedTie);
            default:
                return 0;
        }

        function _genericEliminationDateCount(clubCount, isTwoLeggedTie) {
            return Math.log2(clubCount) * (isTwoLeggedTie ? 2 : 1);
        }
    }

    getGroupDateCount() {
        return this.regulation === 'groups' ? (Config.championship.cup.groupClubCount - 1) * (this.isTwoLeggedTie ? 2 : 1) : 0;
    }
}