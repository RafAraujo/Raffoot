class MatchSimulation {
    constructor(matchId, logActions = false) {
        this._matchId = matchId;
        this.logActions = logActions;

        this._ballPossessorId = null;
        this._matchSimulationActionIds = [];
    }

    static create(match) {
        const matchSimulation = new MatchSimulation(match.id);
        matchSimulation.id = Context.game.matchSimulations.push(matchSimulation);
        return matchSimulation;
    }

    static getById(id) {
        return Context.game.matchSimulations[id - 1];
    }

    get ballLocation() {
        return this.ballPossessor.fieldLocalization.position.fieldRegion;
    }

    get ballPossessor() {
        return this.match.playersOnField.find(p => p.id === this._ballPossessorId);
    }

    set ballPossessor(player) {
        this._ballPossessorId = player.id;
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

    get match() {
        return Match.getById(this._matchId);
    }

    get matchSimulationActions() {
        return Context.game.matchSimulationActions.filterByIds(this._matchSimulationActionIds);
    }

    get previousAction() {
        return this.matchSimulationActions.length > 1 ? this.matchSimulationActions[this.matchSimulationActions.length - 2] : null;
    }

    addAction(matchSimulationAction) {
        this._matchSimulationActionIds.push(matchSimulationAction.id);
    }

    getMatchSimulationEvents(type, club) {
        let events = this.matchSimulationActions.flatMap(a => a.matchSimulationEvents);
        events = events.filter(e => e.type === type && e.player.club.id === club.id);
        return events;
    }

    getActions(type, club, onlySuccessful) {
        let actions = this.matchSimulationActions.filter(a => a.type === type && a.club.id === club.id);
        if (onlySuccessful) {
            actions = actions.filter(a => a.isSuccessful)
        }
        return actions;
    }

    nextAction(time) {
        const action = this._chooseAction(time);
        action.evaluate();

        if (this.logActions) {
            this._logAction(action);
        }

        this._drainEnergy();
        return action;
    }

    prepare() {
        this.ballPossessor = this.match.clubHome.goalkeeper;
    }

    testAlgorithm() {
        const total = 500;

        const table = {
            wins: 0,
            draws: 0,
            defeats: 0
        };

        const match = this.match;

        for (let i = 0; i < total; i++) {
            this.test();
            match.isFinished = true;
            const winner = match.getWinner();
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

        let action = null;
        const fieldLocalization = this.ballPossessor.fieldLocalization;

        if (this.previousAction?.isSuccessful && result < fieldLocalization.line * fieldLocalization.position.fieldRegion.id) {
            action = MatchSimulationActionFinishing.create(this, time);
        }
        else {
            action = MatchSimulationActionPassing.create(this, time);
        }

        return action;
    }

    _drainEnergy() {
        for (const player of this.match.playersOnField) {
            player.energy = Math.max(player.energy - player.age * 0.01, 0);
            player.energy = Math.round(player.energy);
        }
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