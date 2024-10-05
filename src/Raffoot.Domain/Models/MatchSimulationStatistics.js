class MatchSimulationStatistics {
    constructor(matchSimulationId) {
        this._matchSimulationId = matchSimulationId;
    }

    static create(matchSimulation) {
        const matchSimulationStatistics = new MatchSimulationStatistics(matchSimulation.id);
        matchSimulationStatistics.id = Context.game.matchSimulationStatistics.push(matchSimulationStatistics);
        return matchSimulationStatistics;
    }

    static getById(id) {
        return Context.game.matchSimulationStatistics[id - 1];
    }

    get matchSimulation() {
        return MatchSimulation.getById(this._matchSimulationId);
    }

    getStats() {
        const clubHomeStats = this._getClubStats(this.matchSimulation.match.clubHome);
        const clubAwayStats = this._getClubStats(this.matchSimulation.match.clubAway);

        const stats = {
            finishing: [clubHomeStats.finishing, clubAwayStats.finishing],
            ballPossession: [Math.round(clubHomeStats.ballPossession), Math.round(clubAwayStats.ballPossession)],
            passing: [clubHomeStats.passing, clubAwayStats.passing],
            passingSuccessful: [clubHomeStats.passingSuccessful, clubAwayStats.passingSuccessful],
            fouls: [clubHomeStats.fouls, clubAwayStats.fouls],
        };

        return stats;
    }

    _getClubStats(club) {
        const finishing = this.matchSimulation.getActions('finishing', club, false).length;
        const ballPossession = (this.matchSimulation.matchSimulationActions.filter(a => a.player.club == club).length / this.matchSimulation.matchSimulationActions.length) * 100;
        const passing = this.matchSimulation.getActions('passing', club, false).length;
        const passingSuccessful = this.matchSimulation.getActions('passing', club, true).length;
        const fouls = this.matchSimulation.getActions('foul', club).length;

        const stats = {
            finishing,
            ballPossession,
            passing,
            passingSuccessful,
            fouls
        };

        return stats;
    }
}