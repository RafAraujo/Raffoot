class SquadPlayer {
    constructor(squadId, playerId) {
        this._squadId = squadId;
        this._playerId = playerId;
        this._fieldLocalizationId = null;
        this.substitutionIndex = null;
    }

    static create(squad, player) {
        let squadPlayer = new SquadPlayer(squad.id, player.id);
        squadPlayer.id = Context.game.squadPlayers.push(squadPlayer);
        squad.addSquadPlayer(squadPlayer);
        return squadPlayer;
    }

    static getById(id) {
        return Context.squadPlayers[id - 1];
    }

    get fieldLocalization() {
        return this._fieldLocalizationId ? FieldLocalization.getById(this._fieldLocalizationId) : null;
    }

    set fieldLocalization(value) {
        this._fieldLocalizationId = value ? value.id : null;
    }

    get isImprovised() {
        return !this.player.positions.some(p => p.fieldLocalization === this.fieldLocalization);
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
            let playerNearestFieldLocalization = this.player.getNearestFieldLocalization(fieldLocalization);
            let overall = this.player.overall - (playerNearestFieldLocalization.calculateDistanceTo(fieldLocalization) * 2);
            return Math.round(overall);
        }
    }
}