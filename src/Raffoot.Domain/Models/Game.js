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

    getNationalLeagueLastPlayedFixture() {
        const nationalLeague = this.getNationalLeague();
        const fixtures = nationalLeague.championshipEditionFixtures.filter(f => f.date < this.currentSeason.currentDate);
        const lastFixture = fixtures.length ? fixtures.last() : null;
        return lastFixture;
    }

    getNationalLeague() {
        const nationalLeagues = this.currentSeason.getNationalLeaguesByCountryId(this.club.country.id);
        for (let nationalLeague of nationalLeagues) {
            if (nationalLeague.clubs.map(c => c.id).includes(this.club.id)) {
                return nationalLeague;
            }
        }
        return null;
    }

    newSeason() {
        let year = this.firstYear;
        let championshipTypes = this.championshipTypes;

        if (this.seasons.length === 0) {
            championshipTypes = championshipTypes.filter(ct => ct.scope === 'national' && ct.format != 'supercup');
        }
        else {
            year = this.seasons.last().year + 1;
        }

        const season = Season.create(year, championshipTypes);
        season.schedule();
        this._currentSeasonId = season.id;
    }
}