class GameService {
    create(name, year) {
        const game = GameFactory.create(name, year);
        return game;
    }

    async getByIdAsync(id) {
        const dao = await this.getDaoAsync();
        const game = await dao.getByIdAsync('Game', id);
        ConnectionFactory.closeConnection();
        return game;
    }

    async getAllAsync() {
        const dao = await this.getDaoAsync();
        let games = await dao.getAllWithKeysAsync('Game');
        games = games.map(o => Object.assign(new Game(), o));
        ConnectionFactory.closeConnection();
        return games;
    }

    async insertAsync(game) {
        const dao = await this.getDaoAsync();
        let result = await dao.insertManyAsync([game]);
        let id = result[0];
        ConnectionFactory.closeConnection();
        return id;
    }

    async saveAsync(game) {
        const dao = await this.getDaoAsync();
        await dao.updateAsync(game, game.id);
        ConnectionFactory.closeConnection();
    }

    // Mayble load only objects of the current season ?
    async loadAsync(id) { 
        let t0 = performance.now();

        const object = await this.getByIdAsync(id);
        const game = Object.assign(new Game(), object);
        game.id = id;
        
        game.championships = game.championships.map(o => Object.assign(new Championship(), o));
        game.championshipEditions = game.championshipEditions.map(o => Object.assign(new ChampionshipEdition(), o));
        game.championshipEditionClubs = game.championshipEditionClubs.map(o => Object.assign(new ChampionshipEditionClub(), o));
        game.championshipEditionEliminationPhases = game.championshipEditionEliminationPhases.map(o => Object.assign(new ChampionshipEditionEliminationPhase(), o));
        game.championshipEditionEliminationPhaseDuels = game.championshipEditionEliminationPhaseDuels.map(o => Object.assign(new ChampionshipEditionEliminationPhaseDuel(), o));
        game.championshipEditionFixtures = game.championshipEditionFixtures.map(o => Object.assign(new ChampionshipEditionFixture(), o));
        game.championshipEditionGroups = game.championshipEditionGroups.map(o => Object.assign(new ChampionshipEditionGroup(), o));
        game.championshipEditionPlayers = game.championships.map(o => Object.assign(new ChampionshipEditionPlayer(), o));
        game.championshipTypes = game.championshipTypes.map(o => Object.assign(new ChampionshipType(), o));
        game.clubs = game.clubs.map(o => Object.assign(new Club(), o));
        game.confederations = game.confederations.map(o => Object.assign(new Confederation(), o));
        game.continents = game.continents.map(o => Object.assign(new Continent(), o));
        game.countries = game.countries.map(o => Object.assign(new Country(), o));
        game.fieldLocalizations = game.fieldLocalizations.map(o => Object.assign(new FieldLocalization(), o));
        game.fieldRegions = game.fieldRegions.map(o => Object.assign(new FieldRegion(), o));
        game.formations = game.formations.map(o => Object.assign(new Formation(), o));
        game.matches = game.matches.map(o => Object.assign(new Match(), o));
        game.matchClubs = game.matchClubs.map(o => Object.assign(new MatchClub(), o));
        game.players = game.players.map(o => Object.assign(new Player(), o));
        game.positions = game.positions.map(o => Object.assign(new Position(), o));
        game.seasons = game.seasons.map(o => Object.assign(new Season(), o));
        game.seasonDates = game.seasonDates.map(o => Object.assign(new SeasonDate(), o));
        game.squads = game.squads.map(o => Object.assign(new Squad(), o));
        game.squadPlayers = game.squadPlayers.map(o => Object.assign(new SquadPlayer(), o));

        Context.game = game;

		console.log(`GameService.loadAsync() took ${(performance.now() - t0)} milliseconds.`);
        
        return game;
    }

    async delete(id) {
        let dao = await this.getDaoAsync();
        await dao.deleteAsync('Game', id);
        ConnectionFactory.closeConnection();
    }

    async getDaoAsync() {
        await this.createDatabaseIfNotExists();
        let connection = await ConnectionFactory.getConnectionAsync(Config.indexedDbName);
        let dao = new GenericDAO(connection);
        return dao;
    }

    async createDatabaseIfNotExists() {
        let databases = await indexedDB.databases();
        let exists = databases.map(db => db.name).includes(Config.indexedDbName);
        if (!exists) {
            ConnectionFactory.createDatabaseAsync(Config.indexedDbName, ['Game']);
        }
    }
}