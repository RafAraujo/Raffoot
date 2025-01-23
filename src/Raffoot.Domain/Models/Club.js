class Club {
    constructor(name, countryId, colors, shortName) {
        this.name = name;
        this._countryId = countryId;
        if (shortName) {
            this._shortName = shortName;
        }
        this._playerIds = [];
        this.money = 0;
        this.colors = colors;
        this.trust = {
            boardOfDirectors: 100,
            supporters: 80
        };
        this.division = null;
        this.lastYearPositionInTheNationalLeague = null;
        this._trophies = [];

        this._formationId = null;
    }

    static minimumPlayersInSquad = 16;

    static create(name, countryId, backgroundColor, shortName = null) {
        const colors = Club._getColors(backgroundColor);
        const club = new Club(name, countryId, colors, shortName);
        club.id = Context.game.clubs.push(club);
        return club;
    }

    static getById(id) {
        return Context.game.clubs[id - 1];
    }

    static getByName(name) {
        return Context.game.clubs.find(c => c.name === name);
    }

    static _getColors(backgroundColor) {
        const foregroundColor = backgroundColor ? ColorHelper.getTextColorBasedOnBackground(backgroundColor) : null;

        const colors = {
            background: backgroundColor,
            backgroundCustom: backgroundColor,
            foreground: foregroundColor,
            foregroundCustom: foregroundColor
        };

        return colors;
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

    get isPlayable() {
        return this.players.length >= Club.minimumPlayersInSquad;
    }

    get marketValue() {
        return this.players.length > 0 ? this.players.map(p => p.marketValue).sum() : 0;
    }

    get overall() {
        return this.players.map(p => p.overall).average();
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

    get shortName() {
        return this._shortName ?? this.name;
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

    getDefenseOverall() {
        const defense = FieldRegion.getByName('defense');
        return this.getRegionOverall(defense);
    }

    getEmptyFieldLocalizations() {
        return this._formationId ? this.formation.fieldLocalizations.filter(fl => !this.getPlayerByFieldLocalization(fl)) : null;
    }

    getLineup(championshipEdition) {
        return this.players.map(p => ({
            player: p,
            championshipEditionPlayer: championshipEdition?.championshipEditionPlayers.find(cep => cep.player.id === p.id)
        }));
    }

    getPlayerWages() {
        return this.players.map(p => p.wage).sum();
    }

    getRegionOverall(fieldRegion) {
        return this.getPlayersAt(fieldRegion).map(p => p.currentOverall).sum();
    }

    getPlayersAt(fieldRegion) {
        return this.playersOnField.filter(p => p.fieldLocalization.position.fieldRegion === fieldRegion);
    }

    getPlayerByFieldLocalization(fieldLocalization) {
        return this.playersOnField.find(sp => sp.fieldLocalization.id === fieldLocalization.id);
    }

    getBestAvailablePlayerForFieldLocalization(fieldLocalization) {
        const players = this.playersOnBench.filter(p => p.position.id === fieldLocalization.position.id && !p.isInjured);
        const player = players.length > 0 ? players.orderBy('-overall', '-energy', 'age')[0] : null;
        return player;
    }

    getBestPlayers(count) {
        return this.players.orderBy('-overall', 'age').take(count);
    }

    getKitsURLs() {
        const urlList = [];
        const descriptions = ['Home', 'Away', 'Goalkeeper', 'Alternative'];
        const game = Context.game;
        for (let i = 1; i <= 4; i++) {
            const url = `${Config.resourcesFolder}/image/data sources/${game.dataSource}/kits/${game.firstYear}/${this.country.name}/${this.name.replace('/', '-')}/${i}.png`;
            urlList.push({ url: url, description: descriptions[i - 1]});
        }
        return urlList;
    }

    getLogoURL() {
        const game = Context.game;
        const file = `${this.name.replace('/', '-')}.png`;
        const url = `${Config.resourcesFolder}/image/data sources/${game.dataSource}/clubs/${this.country.name}/${file}`;
        return url;
    }

    getBestPlayersWithoutGoalkeeper(count) {
        return this.players.filter(p => !p.position.isGoalkeeper).orderBy('-overall', 'age').take(count);
    }

    getRecommendedFormation() {
        const ranking = [];

        for (const formation of Context.game.formations) {
            const positionIds = formation.positions.map(p => p.id);
            const players = this.players.filter(p => positionIds.includes(p.position.id));

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
                let availablePlayers = this.playersOnBench.filter(p => !p.isInjured);
                let players = availablePlayers.filter(p => p.position.fieldRegion === fieldLocalization.position.fieldRegion);

                if (players.length === 0) {
                    players = availablePlayers;
                }

                for (const player of players) {
                    ranking.push({
                        player: player,
                        overall: player.calculateOverallAt(fieldLocalization)
                    });
                }

                chosenPlayer = ranking.orderBy('-overall', '-player.energy', 'player.age')[0].player;
            }

            if (chosenPlayer)
                chosenPlayer.fieldLocalization = fieldLocalization;
        }
    }

    setSquadOrder() {
        let order = 0;
        for (const player of this.playersOnField) {
            player.order = ++order;
        }
        for (const player of this.playersOnBench.orderBy('order', 'position.id', '-overall')) {
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
        for (const player of this.players) {
            player.rest(days);
        }
    }

    pay(amount, notify = false) {
        if (notify)
            dispatchEvent(this._createEventMoneyChange(this.money, this.money - amount));
        this.money -= amount;
    }

    payWages(notify) {
        const wages = this.getPlayerWages();
        this.pay(wages, notify);
    }

    receive(amount, notify = false) {
        if (notify)
            dispatchEvent(this._createEventMoneyChange(this.money, this.money + amount));
        this.money += amount;
    }

    resetColors() {
        this.colors.backgroundCustom = this.colors.background;
        this.colors.foregroundCustom = this.colors.foreground;
    }

    _createEventMoneyChange(previousValue, value) {
        const moneyChangeEvent = new CustomEvent('moneychange', {
            detail: { previousValue: previousValue, value: value }
        });
        return moneyChangeEvent;
    }
}