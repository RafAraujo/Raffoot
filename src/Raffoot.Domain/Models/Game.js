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
        this.playerTransfers = [];
        this.positions = [];
        this.seasons = [];
        this.seasonDates = [];

        this.matchSimulations = [];
        this.matchSimulationActions = [];
        this.matchSimulationEvents = [];
        this.matchSimulationStatistics = [];
        this.playerSubstitutions = [];

        this.dataSource = dataSource;
        this.isFantasyMode = this.dataSource === 'FM' || firstYear < 2005;
        this.isPaused = false;

        this.messages = [];

        this.config = {
            autoSave: false,
            fullScreen: false,
            language: Config.language,
            matchSpeed: Config.matchSpeedOptions['Super fast'],
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

    async advanceDate() {
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

    arrangeSquads() {
        const positionFormationsMap = new Map();
        for (const position of this.positions)
            if (!positionFormationsMap.has(position.id))
                positionFormationsMap.set(position.id, position.idealFormations);

        const clubs = this.clubs.filter(c => c.isPlayable);
        for (const club of clubs)
            club.arrangePlayers(positionFormationsMap);
    }

    distributeInitialMoneyForClubs() {
        const clubs = this.clubs.filter(c => c.isPlayable);

        for (const club of clubs) {
            club.money = 0;
            const playerWages = club.getPlayerWages();
            club.receive(playerWages * 18);
        }
    }

    definePromotionAndRelegation() {
        const allNationalLeagues = this.championships.filter(c => c.isNationalLeague);
        const confederations = this.confederations.filter(c => c.isPlayable);

        for (const confederation of confederations) {
            const nationalLeagues = allNationalLeagues.filter(c => c.confederation.id === confederation.id);

            const clubsWithoutDivisionCount = confederation.clubs.length - nationalLeagues.flatMap(c => c.clubCount).sum();
            const lastDivision = nationalLeagues.length;

            let division = 1;
            while (division <= lastDivision) {
                const nationalLeague = nationalLeagues.find(c => c.division === division);
                nationalLeague.promotionClubCount = division === 1 ? 0 : nationalLeague.maxClubCountForPromotion;
                division++;
            }

            division = lastDivision;
            while (division >= 1) {
                const nationalLeague = nationalLeagues.find(c => c.division === division);
                const lowerDivision = nationalLeagues.find(c => c.division === division + 1);
                nationalLeague.relegationClubCount = division === lastDivision ? Math.min(clubsWithoutDivisionCount, nationalLeague.maxClubCountForRelegation) : lowerDivision.promotionClubCount;
                division--;
            }
        }
    }

    distributeContinentalSlots() {
        const continentalCup = ChampionshipType.find('continental', 'cup');
        const continentalCups = this.championships.filter(c => c.championshipType.id === continentalCup.id);

        for (const continentalCup of continentalCups) {
            const weight = 1;
            const orderBy = continentalCup.division === 1 ? 'overall' : '-overall';
            const confederations = continentalCup.continent.confederations.filter(c => c.isPlayable).orderBy(orderBy);

            const confederationWeights = confederations.map((c, index) => ({
                confederation: c,
                weight: weight + index / 10
            }));

            const totalWeight = confederationWeights.map(c => c.weight).sum();
            const totalSlots = continentalCup.clubCount;
            let distributedSlots = 0;

            for (const confederationWeight of confederationWeights) {
                const slots = Math.round((confederationWeight.weight / totalWeight) * totalSlots);
                confederationWeight.confederation.setContinentalCupSlots(slots, continentalCup.division);
                distributedSlots += slots;
            }

            if (distributedSlots < totalSlots) {
                confederations.last().addContinentalCupSlot(continentalCup.division);
                distributedSlots++;
            }

            if (distributedSlots != totalSlots)
                throw new Error();
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
        const table = nationalLeague.getLeagueTable();
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

        if (isFirstSeason)
            championshipTypes = championshipTypes.filter(ct => ct.scope === 'national' && ct.format != 'supercup');
        else
            year = this.seasons.last().year + 1;

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
        for (const match of matches)
            match.prepare();

        const matchSimulations = matches.map(m => m.matchSimulation);

        const interval = setInterval(() => {
            if (this.isPaused)
                return;

            for (const matchSimulation of matchSimulations)
                matchSimulation.nextAction(this.time);

            if (++this.time === 90) {
                clearInterval(interval);

                for (const match of matches)
                    match.finish();

                if (callback)
                    callback();
            }
        }, speed);
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
}