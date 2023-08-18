class MatchSimulationEvent {
    constructor(type, player, time) {
        this.type = type;
        this.player = player;
        this.time = time;
    }

    get club() {
        return this.player.club;
    }
}