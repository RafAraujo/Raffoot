class PlayerTransfer {
    constructor(playerId, originClubId, destinationClubId, seasonDateId, value) {
        this._playerId = playerId;
        this._originClubId = originClubId;
        this._destinationClubId = destinationClubId;
        this._seasonDateId = seasonDateId;
        this.value = value;
        this.accepted = false;
    }

    static create(player, destinationClub, seasonDate, value) {
        const transfer = new Transfer(player.id, player.club?.id, destinationClub.id, seasonDate.id, value);
        playerTransfer.id = Context.game.transfers.push(transfer);
        return playerTransfer;
    }

    static getById(id) {
        return Context.game.transfers[id - 1];
    }

    get player() {
        return Player.getById(this._playerId);
    }

    get originClub() {
        return Club.getById(this._originClubId);
    }

    get destinationClub() {
        return Club.getById(this._destinationClubId);
    }

    get seasonDate() {
        return SeasonDate.getById(this._seasonDateId);
    }

    get date() {
        return this.seasonDate.date;
    }
}