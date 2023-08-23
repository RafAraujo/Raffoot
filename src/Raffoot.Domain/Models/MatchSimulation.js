class MatchSimulation {
    constructor(match) {
        this.match = match;

        this._ballPossessor = this.match.clubHome.goalkeeper;
        this._moves = [];
        this._events = [];
    }

    get _allPlayers() {
        return this._clubAttacking.players.concat(this._clubDefending.players);
    }

    get _ballLocation() {
        return this._ballPossessor.fieldLocalization.position.fieldRegion;
    }

    get _clubAttacking() {
        return this._ballPossessor.club;
    }

    get _clubDefending() {
        return this.match.getOpponent(this._clubAttacking.id);
    }

    get _currentMove() {
        return this._moves.last();
    }

    get _previousMove() {
        return this._moves[this._moves.length - 2];
    }

    clubsAnalysis() {
        const clubHomeGoalkeeperOverall = this._match.clubHome.goalkeeper.overall;
        const clubHomeDefenseOverall = this._match.clubHome.getRegionOverall(FieldRegion.getByName('defense'));
        const clubHomeMidfieldOverall = this._match.clubHome.getRegionOverall(FieldRegion.getByName('midfield'));
        const clubHomeAttackOverall = this._match.clubHome.getRegionOverall(FieldRegion.getByName('attack'));

        const clubAwayGoalkeeperOverall = this._match.clubHome.goalkeeper.overall;
        const clubAwayDefenseOverall = this._match.clubHome.getRegionOverall(FieldRegion.getByName('defense'));
        const clubAwayMidfieldOverall = this._match.clubHome.getRegionOverall(FieldRegion.getByName('midfield'));
        const clubAwayAttackOverall = this._match.clubHome.getRegionOverall(FieldRegion.getByName('attack'));

        return {
            'goal': `${clubHomeGoalkeeperOverall} x ${clubAwayGoalkeeperOverall}`,
            'defense': `${clubHomeDefenseOverall} x ${clubAwayDefenseOverall}`,
            'midfield': `${clubHomeMidfieldOverall} x ${clubAwayMidfieldOverall}`,
            'attack': `${clubHomeAttackOverall} x ${clubAwayAttackOverall}`,
        }
    }

    stats() {
        const clubHomePassing = this._getMoves('passing', this._match.clubHome, false).length;
        const clubHomePassingSuccessful = this._getMoves('passing', this._match.clubHome, true).length;
        const clubHomeFinishing = this._getMoves('finishing', this._match.clubHome, false).length;
        const clubHomeFinishingSuccessful = this._getMoves('finishing', this._match.clubHome, true).length;

        const clubAwayPassing = this._getMoves('passing', this._match.clubAway, false).length;
        const clubAwayPassingSuccessful = this._getMoves('passing', this._match.clubAway, true).length;
        const clubAwayFinishing = this._getMoves('finishing', this._match.clubAway, true).length;
        const clubAwayFinishingSuccessful = this._getMoves('finishing', this._match.clubAway, true).length;

        return {
            passes: `${clubHomePassing} (${clubHomePassingSuccessful}) x ${clubAwayPassing} (${clubAwayPassingSuccessful})`,
            finishes: `${clubHomeFinishing} (${clubHomeFinishingSuccessful}) x ${clubAwayFinishing} (${clubAwayFinishingSuccessful})`,
        };
    }

    nextMove(time) {
        debugger;
        const action = this._chooseAction();

        const move = {
            time,
            ballPossessor: this._ballPossessor,
            action,
            values: {
                success: 0,
                failure: 0,
                result: 0
            }
        };

        this._moves.push(move);

        if (action === 'passing') {
            const playersAhead = this._clubAttacking.playersOnField.filter(p => p.fieldLocalization.line > this._ballPossessor.fieldLocalization.line);
            const target = playersAhead.length > 0 ? playersAhead.getRandom() : this._clubAttacking.getPlayersAt(FieldRegion.getByName('midfield')).getRandom();
            const marker = this._clubDefending.getPlayersAt(this._ballLocation.inverse).getRandom();

            move.values.success = this._ballPossessor.overall + this._clubAttacking.getRegionOverall(this._ballLocation) + (this._ballLocation.name === 'goal' ? this._clubAttacking.getRegionOverall(FieldRegion.getByName('defense')) : 0);
            move.values.failure = this._clubDefending.getRegionOverall(marker.fieldLocalization.position.fieldRegion);
            move.values.result = Random.number(move.values.success + move.values.failure);

            if (move.success = move.values.result <= move.values.success) {
                if (!marker.redCard && move.values.result <= this._ballPossessor.overall * 0.1) {
                    this._addYellowCard(marker);
                }
                this._ballPossessor = target;
            }
            else {
                this._ballPossessor = this._clubDefending.getPlayersAt(this._ballLocation.inverse).getRandom();
            }
        }
        else if (action === 'finishing') {
            move.values.success = this._ballPossessor.overall;
            move.values.failure = this._clubDefending.goalkeeper.overall + this._clubDefending.getRegionOverall(FieldRegion.getByName('defense'));
            move.values.result = Random.number(move.values.success + move.values.failure);

            if (move.success = move.values.result <= move.values.success) {
                this._addGoal(this._ballPossessor.club.id);
            }

            this._ballPossessor = this._clubDefending.goalkeeper;
        }

        if (time % 10 === 0) {
            this._drainEnergy();
        }

        return move;
    }

    _addAssist() {
        const player = this._previousMove.ballPossessor;
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.assists++;
    }

    _addGoal() {
        this.match.addGoal(this._ballPossessor.club.id);
        const goal = new MatchSimulationEvent('goal', this._ballPossessor, this._currentMove.time);
        this._events.push(goal);
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(this._ballPossessor);
        championshipEditionPlayer.goals++;
        if (this._previousMove && this._previousMove.ballPossessor.club.id === this._ballPossessor.club.id && this._previousMove.action === 'passing') {
            this._addAssist();
        }
    }

    _addYellowCard(player) {
        const playerHasYellowCard = this._moves.find(m => m.event?.type === 'yellow card' && m.event?.player.id === player.id);
        const yellowCard = new MatchSimulationEvent('yellow card', player.id, this._currentMove.time);
        this._events.push(yellowCard);
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.yellowCards++;
        if (playerHasYellowCard) {
            this._addRedCard(player.id, this._currentMove.time);
        }
    }

    _addRedCad(player) {
        const redCard = new MatchSimulationEvent('red card', player.id, this._currentMove.time);
        this._events.push(redCard);
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.redCard = true;
        player.fieldLocalization = null;
    }

    _getChampionshipEditionPlayer(player) {
        let championshipEditionPlayer = this.match.championshipEdition.championshipEditionPlayers.find(cep => cep.player.id === player.id);
        if (!championshipEditionPlayer) {
            championshipEditionPlayer = ChampionshipEditionPlayer.create(this.match.championshipEdition, player);
        }
        return championshipEditionPlayer;
    }

    _chooseAction() {
        const result = Random.number(100);

        switch (this._ballPossessor.fieldLocalization.position.fieldRegion.name) {
            case 'goal':
                return 'passing';
            case 'defense':
                return result > this._ballPossessor.fieldLocalization.line * 1 ? 'passing' : 'finishing';
            case 'midfield':
                return result > this._ballPossessor.fieldLocalization.line * 2 ? 'passing' : 'finishing';
            case 'attack':
                return result > this._ballPossessor.fieldLocalization.line * 3 ? 'passing' : 'finishing';
        }
    }

    _drainEnergy() {
        for (const player of this._allPlayers) {
            player.energy = Math.max(player.energy - player.age * 0.1, 0);
        }
    }

    _getMoves(action, club, onlySuccessful) {
        let moves = this._moves.filter(m => m.action === action && m.ballPossessor.club.id === club.id);
        if (onlySuccessful) {
            moves = moves.filter(m => m.success)
        }
        return moves;
    }
}