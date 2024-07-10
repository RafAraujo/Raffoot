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

        this.matchSimulations = [];
        this.matchSimulationActions = [];
        this.matchSimulationEvents = [];

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
        const matches = this.currentSeason.currentSeasonDate.matches.map(m => Vue.toRaw(m));
        for (const match of matches) {
            delete match.matchSimulation;
        }

        const previousDate = this.currentSeason.currentDate;

        this._qualifyToNextEliminationPhases();

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

    _qualifyToNextEliminationPhases() {
        const currentDate = this.currentSeason.currentDate;
        const championshipEditionEliminationPhases = this.championshipEditionEliminationPhases.filter(ceep => ceep.lastDate === currentDate);
        
        for (const eliminationPhase of championshipEditionEliminationPhases) {
            const championshipEdition = eliminationPhase.championshipEdition;
            const winners = [];
            for (const duel of eliminationPhase.championshipEditionEliminationPhaseDuels) {
                const winner = duel.getWinner();
                winners.push(winner);
            }
            const nextEliminationPhase = this.currentSeason.getChampionshipEditionNextEliminationPhase(championshipEdition);
            nextEliminationPhase.qualify(winners);
        }
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

    getPlayableCountries(continentId) {
        const countryIds = Context.game.countries.filter(c => c.continent?.id === continentId).map(c => c.id);

        const countries =
            this.currentSeason.getNationalLeagues()
                .flatMap(ce => ce.championship.countries)
                .distinct()
                .filter(c => countryIds.includes(c.id));

        return countries;
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

    play(callback) {
        this.time = 0;
        const matches = this.currentSeason.currentSeasonDate.matches.map(m => Vue.toRaw(m));
        for (const match of matches) {
            match.prepare();
        }
        const matchSimulations = matches.map(m => m.matchSimulation);
        const includesMyClub = matches.flatMap(m => m.clubs).includes(this.club);
        
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

    playOld(callback) {
        this.time = 0;
        const matches = this.currentSeason.currentSeasonDate.matches.map(m => Vue.toRaw(m));
        for (const match of matches) {
            match.prepare();
        }
        const matchSimulations = matches.map(m => m.matchSimulation);
        
        let index = 0;

        do {
            let t0 = performance.now();

            for (const matchSimulation of matchSimulations) {
                matchSimulation.nextAction(this.time);
            }

            console.log(`matchSimulation.nextAction() ${index++} took ${(performance.now() - t0)} milliseconds.`);
        }
        while (++this.time < 90);

        for (const match of matches) {
            match.finish();
        }

        callback();
    }
}