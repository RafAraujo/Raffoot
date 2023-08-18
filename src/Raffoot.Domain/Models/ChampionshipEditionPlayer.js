class ChampionshipEditionPlayer {
    constructor(championshipEditionId, playerId) {
        this._championshipEditionId = championshipEditionId;
        this._playerId = playerId;
        this.appearances = 0;
        this.goals = 0;
        this.assists = 0;
        this.yellowCards = 0;
        this.redCard = false;
        this.ratings = [];
    }

    static create(championshipEdition, player) {
        const championshipEditionPlayer = new ChampionshipEditionPlayer(championshipEdition.id, player.id);
        championshipEditionPlayer.id = Context.game.championshipEditionPlayers.push(championshipEditionPlayer);

        championshipEdition.addChampionshipEditionPlayer(championshipEditionPlayer);

        return championshipEditionPlayer;
    }

    static getById(id) {
        return Context.game.championshipEditionPlayers[id - 1];
    }

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get player() {
        return Player.getById(this._playerId);
    }

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get player() {
        return Player.getById(this._playerId);
    }

    get averageRating() {
        return this.ratings.average();
    }

    get isSuspended() {
        return this.yellowCards === 3 || this.redCard;
    }

    clearSuspension() {
        this.yellowCards = 0;
        this.redCard = false;
    }
}