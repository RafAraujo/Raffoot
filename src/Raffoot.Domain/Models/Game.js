class Game {
    constructor(name, firstYear) {
        this.name = name;
        this.firstYear = firstYear;

        this._clubId = null;
        this.clubName = null;

        this._currentSeasonId = null;
        this.year = firstYear;

        this.countries = [];
        this.positions = [];
        this.fieldLocalizations = [];
        this.formations = [];
        this.clubs = [];
        this.players = [];
        this.championshipTypes = [];
        this.championships = [];
        this.matches = [];
        this.matchClubs = [];
        this.championshipEditions = [];
        this.championshipEditionClubs = [];
        this.championshipEditionEliminationPhases = [];
        this.championshipEditionEliminationPhaseDuels = [];
        this.championshipEditionFixtures = [];
        this.championshipEditionGroups = [];
        this.championshipEditionPlayers = [];
        this.seasons = [];
        this.seasonDates = [];
        this.squads = [];
        this.squadPlayers = [];
    }

    get club() {
        return Club.getById(this._clubId);
    }

    set club(value) {
        this._clubId = value?.id;
        this.clubName = value?.name;
    }

    get currentSeason() {
        return Season.getById(this._currentSeasonId);
    }

    newSeason() {
        let year = this.firstYear;
        let championshipTypes = this.championshipTypes;

        if (this.seasons.length === 0) {
            championshipTypes = championshipTypes.filter(ct => ct.scope === 'national' && ct.format != 'superCup');
        }
        else {
            year = this.seasons.last().year + 1;
        }

        let season = Season.create(year, championshipTypes);
        season.schedule();
        this._currentSeasonId = season.id;
    }
}