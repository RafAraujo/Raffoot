class GameService {
    create(dataSource, year, name, combineCountries) {
        const game = GameFactory.create(dataSource, year, name, combineCountries);
        return game;
    }

    compress(game) {
        const string = JSON.stringify(game);
        const compressed = LZString.compressToEncodedURIComponent(string);
        return compressed;
    }

    decompress(content) {
        const decompressed = LZString.decompressFromEncodedURIComponent(content);
        const object = JSON.parse(decompressed);
        const game = Object.assign(new Game(), object);

        for (const seasonDate of game.seasonDates)
            if (!(seasonDate instanceof Date))
                seasonDate.date = new Date(seasonDate.date);

        return game;
    }

    async getByIdAsync(id) {
        const dao = await this._getDaoAsync();
        const game = await dao.getByIdAsync('Game', id);
        ConnectionFactory.closeConnection();
        return game;
    }

    async getAllAsync() {
        const dao = await this._getDaoAsync();
        let games = await dao.getAllWithKeysAsync('Game');
        games = games.map(o => Object.assign(new Game(), o));
        ConnectionFactory.closeConnection();
        return games;
    }

    async insertAsync(game) {
        const dao = await this._getDaoAsync();
        const result = await dao.insertManyAsync([game]);
        const id = result[0];
        ConnectionFactory.closeConnection();
        return id;
    }

    async saveAsync(game) {
        const dao = await this._getDaoAsync();
        await dao.updateAsync(game, game.id);
        ConnectionFactory.closeConnection();
    }

    // Mayble load only objects of the current season ?
    async loadAsync(id) {
        let t0 = performance.now();

        id = id === 'mock' ? id : parseInt(id);

        let object = null;
        if (id === 'mock')
            object = await this._loadMock();
        else 
            object = await this.getByIdAsync(id);

        if (object == null)
            return null;
        
        const game = this._cast(object);
        game.id = id;
        Context.game = game;

		console.log(`GameService.loadAsync() took ${(performance.now() - t0)} milliseconds.`);
        
        return game;
    }

    async delete(id) {
        const dao = await this._getDaoAsync();
        await dao.deleteAsync('Game', id);
        ConnectionFactory.closeConnection();
    }

    _cast(object) {
        const game = Object.assign(new Game(), object);
        
        game.championships = game.championships.map(o => Object.assign(new Championship(), o));
        game.championshipEditions = game.championshipEditions.map(o => Object.assign(new ChampionshipEdition(), o));
        game.championshipEditionClubs = game.championshipEditionClubs.map(o => Object.assign(new ChampionshipEditionClub(), o));
        game.championshipEditionEliminationPhases = game.championshipEditionEliminationPhases.map(o => Object.assign(new ChampionshipEditionEliminationPhase(), o));
        game.championshipEditionEliminationPhaseDuels = game.championshipEditionEliminationPhaseDuels.map(o => Object.assign(new ChampionshipEditionEliminationPhaseDuel(), o));
        game.championshipEditionFixtures = game.championshipEditionFixtures.map(o => Object.assign(new ChampionshipEditionFixture(), o));
        game.championshipEditionGroups = game.championshipEditionGroups.map(o => Object.assign(new ChampionshipEditionGroup(), o));
        game.championshipEditionPlayers = game.championshipEditionPlayers.map(o => Object.assign(new ChampionshipEditionPlayer(), o));
        game.championshipTypes = game.championshipTypes.map(o => Object.assign(new ChampionshipType(), o));
        game.clubs = game.clubs.map(o => Object.assign(new Club(), o));
        game.confederations = game.confederations.map(o => Object.assign(new Confederation(), o));
        game.continents = game.continents.map(o => Object.assign(new Continent(), o));
        game.countries = game.countries.map(o => Object.assign(new Country(), o));
        game.fieldLocalizations = game.fieldLocalizations.map(o => Object.assign(new FieldLocalization(), o));
        game.fieldRegions = game.fieldRegions.map(o => Object.assign(new FieldRegion(), o));
        game.formations = game.formations.map(o => Object.assign(new Formation(), o));
        game.matches = game.matches.map(o => Object.assign(new Match(), o));
        game.players = game.players.map(o => Object.assign(new Player(), o));
        game.positions = game.positions.map(o => Object.assign(new Position(), o));
        game.seasons = game.seasons.map(o => Object.assign(new Season(), o));
        game.seasonDates = game.seasonDates.map(o => Object.assign(new SeasonDate(), o));
        game.playerTransfers = game.playerTransfers.map(o => Object.assign(new PlayerTransfer(), o));

        return game;
    }

    async _getDaoAsync() {
        await this._createDatabaseIfNotExists();
        const connection = await ConnectionFactory.getConnectionAsync(Config.indexedDbName);
        const dao = new GenericDAO(connection);
        return dao;
    }

    async _createDatabaseIfNotExists() {
        const databases = await indexedDB.databases();
        const exists = databases.map(db => db.name).includes(Config.indexedDbName);
        if (!exists) {
            ConnectionFactory.createDatabaseAsync(Config.indexedDbName, ['Game']);
        }
    }

    async _loadMock() {
        await ScriptHelper.load(Config.files.mockScript);
        const object = this.decompress(mock);
        return object
    }
}