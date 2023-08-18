class MatchSimulation {
    constructor(match) {
        this._match = match;
        this._time = 0;

        this._ballPossessor = this._match.clubHome.goalkeeper;
        this._moves = [];
    }

    get isFinished() {
        return this._time === 90;
    }

    get _ballLocation() {
        return this._ballPossessor.fieldLocalization.position.fieldRegion;
    }

    get _attackingClub() {
        return this._ballPossessor.matchClub;
    }

    get _defendingClub() {
        return this._attackingClub.opponent;
    }

    get _players() {
        return this._attackingClub.matchPlayers.concat(this._defendingClub.matchPlayers).map(mp => mp.player);
    }

    nextMove() {
        const action = this._chooseAction();

        const move = {
            time: this._time,
            ballPossessor: this._ballPossessor,
            action: action
        };

        const pro = 0, con = 0;

        if (action === 'passing') {
            let target = this._ballPossessor.playersAhead.length > 0 ? this._ballPossessor.playersAhead.getRandom() : this._attackingClub.playersAt(FieldRegion.find('midfield')).getRandom();
            let marker = this._defendingClub.getPlayersAt(this._ballLocation.inverse).getRandom();

            pro = this._ballPossessor.overall + this._attackingClub.getRegionOverall(this._ballLocation) + this._ballLocation.name === 'goal' ? this._attackingClub.regionOverall('defense') : 0;
            con = this._defendingClub.getRegionOverall(marker.fieldLocalization.position.fieldRegion);
            let result = Random.number(pro + con);

            if (move.success = result <= pro) {
                if (!marker.redCard && result <= this._ballPossessor.overall * 0.1) {
                    this._addYellowCard(marker);
                    move.event = new MatchSimulationEvent(marker.redCard ? 'red card' : 'yellow card', marker, move.time);
                }
                this._ballPossessor = target;
            }
            else {
                this._ballPossessor = this._defendingClub.getPlayersAt(this._ballLocation.inverse).getRandom();
            }
        }
        else if (action === 'finishing') {
            pro = this._ballPossessor.overall;
            con = this._defendingClub.goalkeeper.overall + this._defendingClub.overallDefense;

            if (move.success = Random.number(pro + con) <= pro) {
                this._ballPossessor.score();
                move.event = new MatchSimulationEvent('goal', this._ballPossessor, move.time);
            }

            this._ballPossessor = this._defendingClub.goalkeeper;
        }

        this._moves.push(this._nextMove());
        if (this._time++ % 10 === 0) {
            this._drainEnergy();
        }

        return move;
    }

    _addYellowCard(player) {
        const championshipEditionPlayer = match.championshipEdition.championshipEditionPlayers.find(cep => cep.player.id === player.id);
    }

    _chooseAction() {
        const result = Random.number(100);

        switch (this._ballPossessor.fieldLocalization.position.fieldRegion.name) {
            case 'goal':
                return 'passing';
            case 'defense':
                return result > this.fieldLocalization.line * 1 ? 'passing' : 'finishing';
            case 'midfield':
                return result > this.fieldLocalization.line * 2 ? 'passing' : 'finishing';
            case 'attack':
                return result > this.fieldLocalization.line * 3 ? 'passing' : 'finishing';
        }
    }

    _drainEnergy() {
        for (const player of this._players) {
            player.energy = Math.max(player.energy - player.age * 0.1, 0);
            player.energy = Math.round(player.energy);
        }
    }

    clubsAnalysis() {
        return {
            'goal': `${this._match.matchClubHome.goalkeeper.overall} x ${this._match.matchClubAway.goalkeeper.overall}`,
            'defense': `${this._match.matchClubHome.overallDefense} x ${this._match.matchClubAway.overallDefense}`,
            'midfield': `${this._match.matchClubHome.overallMidfield} x ${this._match.matchClubAway.overallMidfield}`,
            'attack': `${this._match.matchClubHome.overallAttack} x ${this._match.matchClubAway.overallAttack}`,
        }
    }

    _getMoves(action, matchClub, onlySuccessful) {
        let moves = this._moves.filter(m => m.action === action && m.ballPossessor.matchClub === matchClub);
        if (onlySuccessful) {
            moves = moves.filter(m => m.success)
        }
        return moves;
    }

    stats() {
        return {
            passes: `${this._getMoves('passing', this._match.matchClubHome, false).length} (${this._getMoves('passing', this._match.matchClubHome, true).length}) x ${this._getMoves('passing', this._match.matchClubAway, false).length} (${this._getMoves('passing', this._match.matchClubAway, true).length})`,
            finishes: `${this._getMoves('finishing', this._match.matchClubHome, false).length} (${this._getMoves('finishing', this._match.matchClubHome, true).length}) x ${this._getMoves('finishing', this._match.matchClubAway, false).length} (${this._getMoves('finishing', this._match.matchClubAway, true).length})`,
        };
    }
}