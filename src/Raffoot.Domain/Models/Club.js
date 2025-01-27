class Club {
    constructor(name, countryId, colors, shortName) {
        this.name = name;
        this._countryId = countryId;
        if (shortName)
            this._shortName = shortName;
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

    get unlistedPlayers() {
        return this.players.filter(p => p.isUnlisted);
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
        this.formation = formation;
        if (formation && automaticLineup) {
            this.setAutomaticLineUp();
        }
        else {
            const players = this.players.orderBy('-overall');
            for (const [index, player] of players.entries())
                player.FieldLocalization = index <= Config.match.maxBenchSize ? FieldLocalization.getByName('SUB') : null;
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

    getBestPlayers(count) {
        return this.players.orderBy('-overall', 'age').take(count);
    }

    getKitsURLs() {
        const urlList = [];
        const descriptions = ['Home', 'Away', 'Goalkeeper', 'Alternative'];
        const game = Context.game;
        for (let i = 1; i <= 4; i++) {
            const url = `${Config.resourcesFolder}/image/data sources/${game.dataSource}/kits/${game.firstYear}/${this.country.name}/${this.name.replace('/', '-')}/${i}.png`;
            urlList.push({ url: url, description: descriptions[i - 1] });
        }
        return urlList;
    }

    getLogoURL() {
        const game = Context.game;
        const file = `${this.name.replace('/', '-')}.png`;
        const url = `${Config.resourcesFolder}/image/data sources/${game.dataSource}/clubs/${this.country.name}/${file}`;
        return url;
    }

    getPlayersFieldLocalizations() {
        return this.players.map(p => ({
            playerId: p.id,
            fieldLocalizationId: p.fieldLocalization?.id ?? null,
        }));
    }

    getRecommendedFormation() {
        const ranking = [];

        for (const formation of Context.game.formations) {
            const positionIds = formation.positions.map(p => p.id);
            const players = this.players.filter(p => positionIds.includes(p.position.id));

            ranking.push({
                formation: formation,
                overall: players.map(p => p.overall).sum(),
                age: players.map(p => p.age).sum(),
            });
        }

        return ranking.orderBy('-overall', '-age')[0].formation;
    }

    movePlayerToBench(player) {
        player.fieldLocalization = FieldLocalization.getByName('SUB');
        player.order = this.players.map(p => p.order).max() + 1;
        this.reorderPlayers();
    }

    movePlayerToField(player, fieldLocalization) {
        player.fieldLocalization = fieldLocalization;
    }

    movePlayerToUnlisted(player) {
        player.fieldLocalization = null;
        player.order = this.players.map(p => p.order).max() + 1;
        this.reorderPlayers();
    }

    reorderPlayers() {
        let order = 0;
        const lists = [this.playersOnField.orderBy('fieldLocalization.id'), this.playersOnBench.orderBy('position.id'), this.unlistedPlayers.orderBy('order')];
        const players = lists.flatMap(p => p);
        for (const player of players)
            player.order = ++order;
    }

    setAutomaticLineUp() {
        for (const player of this.players)
            player.fieldLocalization = null;

        let fieldLocalizations = this.formation.fieldLocalizations.slice();
        for (let i = 0; i < 2; i++) {
            if (i === 1)
                fieldLocalizations.unshift(FieldLocalization.getByName('GK'));

            for (const fieldLocalization of fieldLocalizations) {
                let chosenPlayer = this._getBestAvailablePlayerForFieldLocalization(fieldLocalization);
                if (chosenPlayer)
                    chosenPlayer.fieldLocalization = i === 0 ? fieldLocalization : FieldLocalization.getByName('SUB');
            }
        }
    }

    setSquadOrder() {
        const lists = [this.playersOnField, this.playersOnBench.orderBy('position.id', '-overall'), this.unlistedPlayers.orderBy('position.id', '-overall')];
        const players = lists.flatMap(p => p);
        let order = 0;
        for (const player of players)
            player.order = ++order;
    }

    swapPlayerRoles(player1, player2) {
        const aux = { fieldLocalization: player1.fieldLocalization, order: player1.order };

        player1.fieldLocalization = player2.fieldLocalization;
        player2.fieldLocalization = aux.fieldLocalization;

        player1.order = player2.order;
        player2.order = aux.order;
    }

    rest(days) {
        for (const player of this.players)
            player.rest(days);
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

    setPlayersFieldLocalizations(playersFieldLocalizations) {
        if (!playersFieldLocalizations)
            return;

        for (const item of playersFieldLocalizations) {
            const player = Player.getById(item.playerId);
            const fieldLocalization = item.fieldLocalizationId ? FieldLocalization.getById(item.fieldLocalizationId) : null;
            player.fieldLocalization = fieldLocalization;
        }
    }

    _getBestAvailablePlayerForFieldLocalization(fieldLocalization) {
        let bestPlayer = null;

        const availablePlayers = this.players.filter(p => !p.fieldLocalization && !p.isInjured);
        let players = availablePlayers.filter(p => p.position.id === fieldLocalization.position.id && !p.isInjured);

        if (players.length > 0) {
            bestPlayer = players.orderBy('-overall', '-energy', 'age')[0];
        }
        else {
            players = availablePlayers.filter(p => p.position.fieldRegion === fieldLocalization.position.fieldRegion);

            if (players.length === 0)
                players = availablePlayers;

            const ranking = [];
            for (const player of players) {
                ranking.push({
                    player: player,
                    overall: player.calculateOverallAt(fieldLocalization)
                });

                bestPlayer = ranking.orderBy('-overall', '-player.energy', 'player.age')[0].player;
            }
        }

        return bestPlayer;
    }

    _createEventMoneyChange(previousValue, value) {
        const moneyChangeEvent = new CustomEvent('moneychange', {
            detail: { previousValue: previousValue, value: value }
        });
        return moneyChangeEvent;
    }
}