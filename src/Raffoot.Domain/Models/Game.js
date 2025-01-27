class Game {
    constructor(dataSource, firstYear, name) {
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

        this.dataSource = dataSource;
        this.isFantasyMode = this.dataSource === 'FM' || firstYear < 2005;
        this.isPaused = false;
        
        this.messages = [];

        this.config = {
            fullScreen: false,
            language: Config.language,
            matchSpeed: Config.matchSpeedOptions.fast,
            search: {
                pageSize: Config.search.pageSize
            },
            theme: Config.theme,
            useClubColors: true,
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
        for (const match of matches)
            delete match.matchSimulation;

        this._qualifyWinnersToNextEliminationPhases();
        this.currentSeason.advanceDate();

        this.matchSimulations = [];
        this.matchSimulationActions = [];
        this.matchSimulationEvents = [];

        const previousDate = this.currentSeason.previousDate;
        const days = Date.daysDiff(previousDate, this.currentSeason.currentDate);

        for (const club of this.clubs)
            club.rest(days);

        if (this.currentSeason.currentDate.getMonth() > previousDate.getMonth()) {
            for (const club of this.clubs) {
                const notify = this.club.id === club.id;
                club.payWages(notify);
            }
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

    getLastFixtures(championshipEdition, count) {
        return championshipEdition.championshipEditionFixtures.filter(cef => cef.seasonDate.date <= this.currentSeason.currentDate).lastItems(count);
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

    getPlayableCountries() {
        const nationalLeagues = this.currentSeason.getNationalLeagues();
        const clubs = nationalLeagues.flatMap(ce => ce.clubs);
        const countries = clubs.map(c => c.country).distinct();
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

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    play(speed, callback) {
        this.time = 0;
        const matches = this.currentSeason.currentSeasonDate.matches.map(m => Vue.toRaw(m));
        for (const match of matches) {
            match.prepare();
        }
        const matchSimulations = matches.map(m => m.matchSimulation);

        let index = 0;

        const interval = setInterval(() => {
            let t0 = performance.now();

            if (this.isPaused)
                return;

            for (const matchSimulation of matchSimulations)
                matchSimulation.nextAction(this.time);

            console.log(`matchSimulation.nextAction() ${index++} took ${(performance.now() - t0)} milliseconds.`);

            if (++this.time === 90) {
                clearInterval(interval);

                for (const match of matches)
                    match.finish();

                if (callback)
                    callback();
            }
        }, speed);
    }
}