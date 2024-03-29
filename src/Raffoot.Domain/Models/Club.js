class Club {
    constructor(name, countryId, colors, externalId) {
        this.name = name;
        this._countryId = countryId;
        this.externalId = externalId;
        this._playerIds = [];
        this.money = 0;
        this.colors = colors;
        this.trust = {
            boardOfDirectors: 100,
            supporters: 80
        };
        this.division = null;
        this._trophies = [];

        this._formationId = null;
    }

    static create(name, countryId, backgroundColor, foregroundColor, externalId) {
        const colors = {
            background: backgroundColor,
            backgroundCustom: backgroundColor,
            foreground: foregroundColor,
            foregroundCustom: foregroundColor
        };
        const club = new Club(name, countryId, colors, externalId);
        club.id = Context.game.clubs.push(club);
        return club;
    }

    static getById(id) {
        return Context.game.clubs[id - 1];
    }

    static getByName(name) {
        return Context.game.clubs.find(c => c.name === name);
    }

    get country() {
        return Country.getById(this._countryId);
    }

    get formation() {
        return Formation.getById(this._formationId);
    }

    set formation(value) {
        this._formationId = value?.id;
    }

    get goalkeeper() {
        return this.playersOnField.find(p => p.position.isGoalkeeper);
    }

    get overall() {
        return this.players.map(p => p.baseOverall).average();
    }

    get players() {
        return Context.game.players.filterByIds(this._playerIds);
    }

    get playersOnBench() {
        return this.players.filter(p => p.isOnBench);
    }

    get playersOnField() {
        return this.players.filter(p => p.isOnField);
    }

    get playerWages() {
        return this.players.map(p => p.wage).sum();
    }

    get throphies() {
        return Context.game.championshipEditions.filterByIds(this._trophies);
    }

    addPlayer(player) {
        this._playerIds.push(player.id);
    }

    addTrophy(championshipEdition) {
        this._trophies.push(championshipEdition.id);
    }

    arrangePlayers() {
        const formation = this.getRecommendedFormation();
        this.changeFormation(formation, true);
    }

    changeFormation(formation, automaticLineup = false) {
        for (const player of this.players) {
            player.fieldLocalization = null;
        }
        this.formation = formation;
        if (formation && automaticLineup) {
            this.setAutomaticLineUp();
        }
    }

    clearFormation() {
        this.changeFormation(null);
    }

    getEmptyFieldLocalizations() {
        return this._formationId ? this.formation.fieldLocalizations.filter(fl => !this.getPlayerByFieldLocalization(fl)) : null;
    }

    getLineup(championshipEdition) {
        return this.players.map(p => ({ player: p, championshipEditionPlayer: championshipEdition?.championshipEditionPlayers.find(cep => cep.player.id === p.id) }));
    }

    getRegionOverall(fieldRegion) {
        return this.getPlayersAt(fieldRegion).map(mp => mp.overall).sum();
    }

    getOverallByFieldRegion(fieldRegion) {
        const players = this.players.filter(p => p.position.fieldRegion.id === fieldRegion.id);
        return players.map(p => p.overall).sum();
    }

    getPlayersAt(fieldRegion) {
        return this.playersOnField.filter(p => p.fieldLocalization.position.fieldRegion === fieldRegion);
    }

    getPlayerByFieldLocalization(fieldLocalization) {
        return this.playersOnField.find(sp => sp.fieldLocalization.id === fieldLocalization.id);
    }

    getBestAvailablePlayerForFieldLocalization(fieldLocalization) {
        const players = this.playersOnBench.filter(p => p.position.id === fieldLocalization.position.id);
        const player = players.length > 0 ? players.orderBy('-baseOverall')[0] : null;
        return player;
    }

    getBestPlayers(count) {
        return this.players.orderBy('-overall', 'age').take(count);
    }

    getKitsURLs() {
        const urlList = [];
        for (let i = 1; i <= 3; i++) {
            const url = `${Config.folders.kitsFolder}/${this.externalId}/${i}.png`;
            urlList.push(url);
        }
        return urlList;
    }

    getLogoURL() {
        return `${Config.folders.logosFolder}/${this.externalId}.png`;
    }

    getBestPlayersWithoutGoalkeeper(count) {
        return this.players.filter(p => !p.position.isGoalkeeper).orderBy('-overall', 'age').take(count);
    }

    getRecommendedFormation() {
        const ranking = [];

        for (const formation of Context.game.formations) {
            const positionIds = formation.positions.map(p => p.id);
            const players = this.players.filter(pl => positionIds.includes(pl.position.id));

            ranking.push({
                formation: formation,
                overall: players.map(p => p.overall).sum(),
            });
        }

        return ranking.orderBy('-overall')[0].formation;
    }

    movePlayerToBench(player) {
        player.fieldLocalization = null;
        player.order = this.players.map(p => p.order).max() + 1;
    }

    movePlayerToField(player, fieldLocalization) {
        player.fieldLocalization = fieldLocalization;
    }

    setAutomaticLineUp() {
        for (const fieldLocalization of this.formation.fieldLocalizations.reverse()) {
            const ranking = [];
            let chosenPlayer = this.getBestAvailablePlayerForFieldLocalization(fieldLocalization);

            if (chosenPlayer === null) {
                let players = this.playersOnBench.filter(p => p.position.fieldRegion === fieldLocalization.position.fieldRegion);

                if (players.length === 0) {
                    players = this.playersOnBench;
                }

                for (const player of players) {
                    ranking.push({
                        player: player,
                        overall: player.calculateOverallAt(fieldLocalization)
                    });
                }

                chosenPlayer = ranking.orderBy('-overall', '-player.energy')[0].player;
            }

            chosenPlayer.fieldLocalization = fieldLocalization;
        }
    }

    setOrder() {
        let order = 0;
        for (const player of this.playersOnField) {
            player.order = ++order;
        }
        for (const player of this.playersOnBench.orderBy('order', 'position.id', '-baseOverall')) {
            player.order = ++order;
        }
    }

    swapPlayerRoles(player1, player2) {
        const aux = { fieldLocalization: player1.fieldLocalization, order: player1.order };

        player1.fieldLocalization = player2.fieldLocalization;
        player2.fieldLocalization = aux.fieldLocalization;

        player1.order = player2.order;
        player2.order = aux.order;
    }

    rest(days) {
        this.players.rest(days);
    }

    pay(amount) {
        this.money -= amount;
    }

    payWages() {
        this.pay(this.playerWages);
    }

    receive(amount) {
        this.money += amount;
    }

    resetColors() {
        this.colors.backgroundCustom = this.colors.background;
        this.colors.foregroundCustom = this.colors.foreground;
    }
}