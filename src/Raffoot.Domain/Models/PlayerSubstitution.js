class PlayerSubstitution {
    constructor(matchId, time, clubId, playerOutId, playerInId) {
        this._matchId = matchId;
        this.time = time;
        this._clubId = clubId;
        this._playerOutId = playerOutId;
        this._playerInId = playerInId;
    }

    static create(match, time, club, playerOut, playerIn) {
        const playerSubstitution = new PlayerSubstitution(match.id, time, club.id, playerOut.id, playerIn.id);
        playerSubstitution.id = Context.game.playerSubstitutions.push(playerSubstitution);

        match.addPlayerSubstitution(playerSubstitution);

        return playerSubstitution;
    }

    get club() {
        return Club.getById(this._clubId);
    }

    get playerOut() {
        return Player.getById(this._playerOutId);
    }

    get playerIn() {
        return Player.getById(this._playerInId);
    }
}