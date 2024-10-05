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
        this.transfers = [];

        this.matchSimulations = [];
        this.matchSimulationActions = [];
        this.matchSimulationEvents = [];
        this.matchSimulationStatistics = [];

        this.config = {
            fullScreen: Config.fullScreen,
            matchSpeed: Config.matchSpeedOptions.ultraFast,
            search: {
                pageSize: Config.search.pageSize
            }
        };
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

    advanceDate() {
        if (this.currentSeason.currentSeasonDate.isTransferWindow) {
            this.currentSeason.advanceDate();
        }
        else {
            const matches = this.currentSeason.currentSeasonDate.matches.map(m => Vue.toRaw(m));
            for (const match of matches) {
                delete match.matchSimulation;
            }

            this._qualifyWinnersToNextEliminationPhases();

            const previousDate = this.currentSeason.currentDate;
            this.currentSeason.advanceDate();
            const days = Date.daysDiff(previousDate, this.currentSeason.currentDate);

            for (const club of this.clubs) {
                club.rest(days);
                if (this.currentSeason.currentDate.getMonth() > previousDate.getMonth()) {
                    club.payWages();
                }
            }

            this.matchSimulations = [];
            this.matchSimulationActions = [];
            this.matchSimulationEvents = [];
        }
    }

    _qualifyWinnersToNextEliminationPhases() {
        const championshipEditionEliminationPhases = this.championshipEditionEliminationPhases
            .filter(ceep => ceep.lastDate === this.currentSeason.currentDate);

        for (const eliminationPhase of championshipEditionEliminationPhases) {
            const championshipEdition = eliminationPhase.championshipEdition;
            const championshipEditionClubs = [];
            for (const duel of eliminationPhase.championshipEditionEliminationPhaseDuels) {
                const winner = duel.getWinner();
                const championshipEditionClub = championshipEdition.championshipEditionClubs.find(cec => cec.club.id === winner.id);
                championshipEditionClubs.push(championshipEditionClub);
            }
            const nextEliminationPhase = this.currentSeason.getChampionshipEditionNextEliminationPhase(championshipEdition);
            nextEliminationPhase.qualify(championshipEditionClubs);
        }
    }

    getCurrentMatch() {
        return this.currentSeason.currentSeasonDate.matches.find(m => m.clubs.map(c => c.id).includes(this._clubId));
    }

    getNationalLeagueByClub(club) {
        const nationalLeagues = this.currentSeason.getNationalLeaguesByCountry(club.country);
        return nationalLeagues.find(ce => ce.clubs.map(c => c.id).includes(club.id));
    }

    getPositionInTheNationalLeagueByClub(club) {
        const nationalLeague = this.getNationalLeagueByClub(club);
        const table = nationalLeague.getTable();
        const position = table.map(cec => cec.club.id).indexOf(club.id) + 1;
        return position;
    }

    getPlayableCountriesByContinent(continentId) {
        const countryIds = Context.game.countries.filter(c => c.continent?.id === continentId).map(c => c.id);

        const countries =
            this.currentSeason.getNationalLeagues()
                .flatMap(ce => ce.championship.countries)
                .distinct()
                .filter(c => countryIds.includes(c.id));

        return countries;
    }

    newSeason() {
        let year = this.firstYear;
        const isFirstSeason = this.seasons.length === 0;
        let championshipTypes = this.championshipTypes;

        if (isFirstSeason) {
            championshipTypes = championshipTypes.filter(ct => ct.scope === 'national' && ct.format != 'supercup');
        }
        else {
            year = this.seasons.last().year + 1;
        }

        const season = Season.create(year, isFirstSeason, championshipTypes);
        season.schedule();
        this._currentSeasonId = season.id;
    }

    play(callback) {
        this.time = 0;
        const matches = this.currentSeason.currentSeasonDate.matches.map(m => Vue.toRaw(m));
        for (const match of matches) {
            match.prepare();
        }
        const matchSimulations = matches.map(m => m.matchSimulation);

        let index = 0;

        const interval = setInterval(() => {
            let t0 = performance.now();

            for (const matchSimulation of matchSimulations) {
                matchSimulation.nextAction(this.time);
            }

            console.log(`matchSimulation.nextAction() ${index++} took ${(performance.now() - t0)} milliseconds.`);

            if (++this.time === 90) {
                clearInterval(interval);

                for (const match of matches) {
                    match.finish();
                }

                callback();
            }
        }, this.config.matchSpeed);
    }
}