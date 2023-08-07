class ChampionshipEditionPlayer {
    constructor(championshipEditionId, playerId) {
        this._championshipEditionId = championshipEditionId;
        this._playerId = playerId;
        this.appearances = 0;
        this.timePlayed = 0;
        this.goals = 0;
        this.assists = 0;
        this.ratings = [];
    }

    static create(player) {
        const championshipEditionPlayer = new ChampionshipEditionPlayer(player.id);
        championshipEditionPlayer.id = Context.game.championshipEditionPlayers.push(championshipEditionPlayer);
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

    get averageRating() {
        return this.ratings.average();
    }
}