class SquadPlayer {
    constructor(squadId, playerId, order) {
        this._squadId = squadId;
        this._playerId = playerId;
        this._fieldLocalizationId = null;
        this.order = order;
    }

    static create(squad, player) {
        const squadPlayer = new SquadPlayer(squad.id, player.id, player.position.id);
        squadPlayer.id = Context.game.squadPlayers.push(squadPlayer);
        
        squad.addSquadPlayer(squadPlayer);
        
        return squadPlayer;
    }

    static getById(id) {
        return Context.game.squadPlayers[id - 1];
    }

    get category() {
        return Player.getCategory(this.overall);
    }

    get fieldLocalization() {
        return this._fieldLocalizationId ? FieldLocalization.getById(this._fieldLocalizationId) : null;
    }

    set fieldLocalization(value) {
        this._fieldLocalizationId = value ? value.id : null;
    }

    get isImprovised() {
        if (this.fieldLocalization) {
            return !this.player.positions.some(p => p.fieldLocalizations.includes(this.fieldLocalization));
        }
        else {
            return false;
        }
    }

    get overall() {
        return this.fieldLocalization ? this.calculateOverallAt(this.fieldLocalization) : this.player.overall;
    }

    get player() {
        return Player.getById(this._playerId);
    }

    get squad() {
        return Squad.getById(this._squadId);
    }

    calculateOverallAt(fieldLocalization) {
        if (this.player.positions.includes(fieldLocalization.position)) {
            return this.player.overall;
        }
        else {
            const playerNearestFieldLocalization = this.player.getNearestFieldLocalization(fieldLocalization);
            const distance = playerNearestFieldLocalization.calculateDistanceTo(fieldLocalization);
            const overall = this.player.overall - (distance * 4);
            return Math.round(overall);
        }
    }
}