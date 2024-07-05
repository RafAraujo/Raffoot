class MatchSimulation {
    constructor(match, logActions = false) {
        this.match = match;
        this.logActions = logActions;

        this.ballPossessor = this.match.clubHome.goalkeeper;
        this.matchSimulationActions = [];
    }

    get allPlayers() {
        const players = this.clubAttacking.playersOnField.concat(this.clubDefending.playersOnField);
        return players;
    }

    get ballLocation() {
        return this.ballPossessor.fieldLocalization.position.fieldRegion;
    }

    get marker() {
        return this.clubDefending.getPlayersAt(this.ballLocation.inverse).getRandom();
    }

    get clubAttacking() {
        return this.ballPossessor.club;
    }

    get clubDefending() {
        return this.match.getOpponent(this.clubAttacking);
    }

    get currentAction() {
        return this.matchSimulationActions.last();
    }

    get previousAction() {
        return this.matchSimulationActions.length > 1 ? this.matchSimulationActions[this.matchSimulationActions.length - 2] : null;
    }

    getMatchSimulationEvents(type, club) {
        let events = this.matchSimulationActions.flatMap(a => a.matchSimulationEvents);
        events = events.filter(e => e.type === type && e.player.club.id === club.id);
        return events;
    }

    getStats() {
        const clubHomeFinishing = this._getActions('finishing', this.match.clubHome, false).length;
        const clubHomeFinishingSuccessful = this._getActions('finishing', this.match.clubAway, true).length;
        const clubHomeBallPossession = (this.matchSimulationActions.filter(a => a.player.club == this.match.clubHome).length / this.matchSimulationActions.length) * 100;
        const clubHomePassing = this._getActions('passing', this.match.clubHome, false).length;
        const clubHomePassingSuccessful = this._getActions('passing', this.match.clubHome, true).length;
        const clubeHomeFouls = this._getActions('foul', this.match.clubHome).length;
        
        const clubAwayFinishing = this._getActions('finishing', this.match.clubAway, true).length;
        const clubAwayFinishingSuccessful = this._getActions('finishing', this.match.clubAway, true).length;
        const clubAwayBallPossession = (this.matchSimulationActions.filter(a => a.player.club == this.match.clubAway).length / this.matchSimulationActions.length) * 100;
        const clubAwayPassing = this._getActions('passing', this.match.clubAway, false).length;
        const clubAwayPassingSuccessful = this._getActions('passing', this.match.clubAway, true).length;
        const clubAwayFouls = this._getActions('foul', this.match.clubAway).length;

        const stats = {
            finishing: [clubHomeFinishing, clubAwayFinishing],
            finishingSuccessful: [clubHomeFinishingSuccessful, clubAwayFinishingSuccessful],
            ballPossession: [Math.round(clubHomeBallPossession), Math.round(clubAwayBallPossession)],
            passing: [clubHomePassing, clubAwayPassing],
            passingSuccessful: [clubHomePassingSuccessful, clubAwayPassingSuccessful],
            fouls: [clubeHomeFouls, clubAwayFouls],
        };

        return stats;
    }

    nextAction(time) {
        const action = this._chooseAction(time);
        this.matchSimulationActions.push(action);
        action.evaluate();

        if (this.logActions) {
            this._logAction(action);
        }

        this._drainEnergy();
        return action;
    }

    testAlgorithm() {
        const total = 1000;

        const table = {
            wins: 0,
            draws: 0,
            defeats: 0
        };

        for (let i = 0; i < total; i++) {
            this.test();
            const winner = this.match.getWinner();
            switch (winner) {
                case this.match.clubHome:
                    table.wins++;
                    break;
                case this.match.clubAway:
                    table.defeats++;
                    break;
                default:
                    table.draws++;
            }
        }

        console.info(table);
    }

    test() {
        this.match.prepare();
        for (let i = 1; i <= 90; i++) {
            this.nextAction(i);
        }
        console.info(this.match.score);
        return this.matchSimulationActions;
    }

    _chooseAction(time) {
        const result = Random.numberBetween(1, 50);

        let action = new MatchSimulationActionPassing(this, time);

        const fieldLocalization = this.ballPossessor.fieldLocalization;
        if (this.previousAction?.isSuccessful && result < fieldLocalization.line * fieldLocalization.position.fieldRegion.id) {
            action = new MatchSimulationActionFinishing(this, time);
        }

        return action;
    }

    _drainEnergy() {
        for (const player of this.allPlayers) {
            player.energy = Math.max(player.energy - player.age * 0.01, 0);
        }
    }

    _getActions(type, club, onlySuccessful) {
        let actions = this.matchSimulationActions.filter(a => a.type === type && a.club.id === club.id);
        if (onlySuccessful) {
            actions = actions.filter(a => a.isSuccessful)
        }
        return actions;
    }

    _logAction(action) {
        const player = `"[${action.player.fieldLocalization.position.abbreviation}] ${action.player.name}"`
        const target = action.target == null ? 'goal' : `"[${action.target.fieldLocalization.position.abbreviation}] ${action.target.name}"`
        console.info(`${action.player.club.name}: ${action.type} from ${player} to ${target} (${action.isSuccessful ? 'Success' : 'Failure'})`);

        for (const event of action.matchSimulationEvents) {
            console.log(event.type.toUpperCase());
        }
    }
}