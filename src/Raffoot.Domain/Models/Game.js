class Game {
    constructor(name, firstYear) {
        this.name = name;
        this.firstYear = firstYear;

        this._clubId = null;
        this.clubName = null;

        this._currentSeasonId = null;
        this.year = firstYear;

        this.championships = [];
        this.championshipEditions = [];
        this.championshipEditionClubs = [];
        this.championshipEditionEliminationPhases = [];
        this.championshipEditionEliminationPhaseDuels = [];
        this.championshipEditionFixtures = [];
        this.championshipEditionGroups = [];
        this.championshipEditionPlayers = [];
        this.championshipTypes = [];
        this.clubs = [];
        this.confederations = [];
        this.continents = [];
        this.countries = [];
        this.fieldLocalizations = [];
        this.fieldRegions = [];
        this.formations = [];
        this.matches = [];
        this.players = [];
        this.positions = [];
        this.seasons = [];
        this.seasonDates = [];

        this.time = 0;
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

    getClubCurrentMatch() {
        return this.currentSeason.currentSeasonDate.matches.find(m => m.clubs.map(c => c.id).includes(this._clubId));
    }

    getClubMatches() {
        return this.currentSeason.getMatchesByClub(this.club);
    }

    getClubNationalLeague() {
        const nationalLeagues = this.currentSeason.getNationalLeaguesByCountry(this.club.country);
        return nationalLeagues.find(ce => ce.clubs.map(c => c.id).includes(this.club.id));
    }

    getClubNextMatch() {
        return this.currentSeason.getNextMatch(this.club.id);
    }

    getNationalLeagueLastPlayedFixture(nationalLeague) {
        const fixtures = nationalLeague.championshipEditionFixtures.filter(f => f.date < this.currentSeason.currentDate);
        const lastFixture = fixtures.length ? fixtures.last() : null;
        return lastFixture;
    }

    newSeason() {
        const year = this.firstYear;
        const isFirstSeason = this.seasons.length === 0;
        let championshipTypes = this.championshipTypes;

        if (isFirstSeason) {
            championshipTypes = championshipTypes.filter(ct => ct.scope === 'national' && ct.format != 'supercup');
        }
        else {
            year = this.seasons.last().year + 1;
        }

        const season = Season.create(year, championshipTypes);
        season.schedule();
        this._currentSeasonId = season.id;
    }

    play() {
        const matches = this.currentSeason.currentSeasonDate.matches.map(m => Vue.toRaw(m));
        const matchSimulations = matches.map(m => m.prepare());
        let index = 0;

        const interval = setInterval(() => {
            let t0 = performance.now();

            for (const matchSimulation of matchSimulations) {
                matchSimulation.nextMove();
            }

            console.log(`matchSimulation.nextMove() ${index++} took ${(performance.now() - t0)} milliseconds.`);

            if (++this.time === 90) {
                clearInterval(interval);
            }
        }, 1);

    }
}