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
        this.lastSeasonLeaguePosition = null;
        this._trophies = [];

        this._formationId = null;
        this._overall = 0;
    }

    static minimumPlayersInSquad = 16;

    static all() {
        return Context.game.clubs;
    }

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
        return this._overall / this._playerIds.length;
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
        this._overall += player.overall;
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
                player.fieldLocalization = index <= Config.match.maxBenchSize ? FieldLocalization.getByName('SUB') : null;
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
            order: p.order,
        }));
    }

    getRecommendedFormation() {
        const formationStats = new Map();

        const formationPositionsMap = Formation.getPositionsMap();
        const bestPlayers = this.players.sort((a, b) => b.overall - a.overall || a.age - b.age).take(16);
    
        for (const [formation, positions] of formationPositionsMap) {
            const players = bestPlayers.slice();
            const stats = { overallSum: 0, ageSum: 0 };
    
            for (const position of positions) {
                const playerIndex = players.findIndex(p => p.position.id === position.id);
                if (playerIndex !== -1) {
                    const player = players.splice(playerIndex, 1)[0];
                    stats.overallSum += player.overall;
                    stats.ageSum += player.age;
                }
            }
    
            formationStats.set(formation, stats);
        }

        let bestFormation = null;
        let bestOverall = -Infinity;
        let bestAge = Infinity;

        for (const [formation, stats] of formationStats) {
            if (stats.overallSum > bestOverall || (stats.overallSum === bestOverall && stats.ageSum < bestAge)) {
                bestFormation = formation;
                bestOverall = stats.overallSum;
                bestAge = stats.ageSum;
            }
        }
    
        return bestFormation;
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
        this._clearLineup();
        this._setPlayersOnField();
        this._setPlayersOnBench();
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
            player.order = item.order;
        }
    }

    _clearLineup() {
        for (const player of this.players)
            player.fieldLocalization = null;
    }
    

    _getBestAvailablePlayerForFieldLocalization(fieldLocalization, positionPriority, fieldRegionPriority) {
        const availablePlayers = this.players.filter(p => !p.fieldLocalization && !p.isInjured);
        let players = [];

        if (positionPriority)
            players = availablePlayers.filter(p => p.position.id === fieldLocalization.position.id);

        if (players.length === 0 && fieldRegionPriority)
            players = availablePlayers.filter(p => p.position.fieldRegion.id === fieldLocalization.position.fieldRegion.id);

        if (players.length === 0)
            players = availablePlayers;

        if (players.length === 0)
            return;

        const chosen = players.reduce((best, player) => {
            const overallAtFieldLocalization = player.calculateOverallAt(fieldLocalization);

            if (!best)
                return { player, overallAtFieldLocalization };

            const isBetterOverall = overallAtFieldLocalization > best.overallAtFieldLocalization;
            const isEqualOverall = overallAtFieldLocalization === best.overallAtFieldLocalization;
            const isBetterEnergy = player.energy > best.player.energy;
            const isEqualEnergy = player.energy === best.player.energy;
            const isYounger = player.age < best.player.age;

            if (
                isBetterOverall ||
                (isEqualOverall && isBetterEnergy) ||
                (isEqualOverall && isEqualEnergy && isYounger)
            ) {
                return { player, overallAtFieldLocalization };
            }

            return best;
        }, null);

        return chosen.player;
    }

    _setPlayersOnField() {
        let fieldLocalizations = this.formation.fieldLocalizations;
        for (const fieldLocalization of fieldLocalizations) {
            const chosenPlayer = this._getBestAvailablePlayerForFieldLocalization(fieldLocalization, true, true);
            if (chosenPlayer)
                chosenPlayer.fieldLocalization = fieldLocalization;
        }
    }

    _setPlayersOnBench() {
        const benchSize = Config.match.maxBenchSize;
        const subFieldLocalization = FieldLocalization.getByName('SUB');

        const availablePlayers = this.players.filter(p => !p.fieldLocalization && !p.isInjured);
        let benchPlayers = [];

        if (availablePlayers.length <= benchSize) {
            benchPlayers = availablePlayers;
        }
        else {
            const goalkeepers = availablePlayers.filter(p => p.position.isGoalkeeper).sort((a, b) => b.overall - a.overall || a.age - b.age).take(2);
            const outfieldPlayers = availablePlayers.filter(p => !p.position.isGoalkeeper).sort((a, b) => b.overall - a.overall || a.age - b.age).take(benchSize - goalkeepers.length);
            benchPlayers = goalkeepers.concat(outfieldPlayers);
        }

        for (const player of benchPlayers)
            player.fieldLocalization = subFieldLocalization;
    }

    _createEventMoneyChange(previousValue, value) {
        const moneyChangeEvent = new CustomEvent('moneychange', {
            detail: { previousValue: previousValue, value: value }
        });
        return moneyChangeEvent;
    }
}