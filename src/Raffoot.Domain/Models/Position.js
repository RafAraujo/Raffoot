class Position {
    constructor(name, abbreviation, fieldRegion) {
        this.name = name;
        this.abbreviation = abbreviation;
        this.fieldRegion = fieldRegion;
        this._fieldLocalizationIds = [];
    }

    static create(name, abbreviation, fieldRegion) {
        let position = new Position(name, abbreviation, fieldRegion);
        position.id = Context.game.positions.push(position);
        return position;
    }

    static getById(id) {
        return Context.game.positions[id - 1];
    }

    static seed() {
		Position.create('Goalkeeper', 'GK', 'goal');
		Position.create('Center Back', 'CB', 'defense');
		Position.create('Left Back', 'LB', 'defense');
		Position.create('Right Back', 'RB', 'defense');
		Position.create('Left Wing Back', 'LWB', 'defense');
		Position.create('Right Wing Back', 'RWB', 'defense');
		Position.create('Center Defensive Midfielder', 'CDM', 'midfield');
		Position.create('Center Midfielder', 'CM', 'midfield');
		Position.create('Left Midfielder', 'LM', 'midfield');
		Position.create('Right Midfielder', 'RM', 'midfield');
		Position.create('Center Attacking Midfielder', 'CAM', 'midfield');
		Position.create('Left Wing', 'LW', 'attack');
		Position.create('Right Wing', 'RW', 'attack');
		Position.create('Center Forward', 'CF', 'attack');
		Position.create('Striker', 'ST', 'attack');
	}

    get fieldLocalizations() {
        return Context.game.fieldLocalizations.filterByIds(this._fieldLocalizationIds);
    }

    get isGoalkeeper() {
        return this.name === 'Goalkeeper';
    }

    addFieldLocalization(fieldLocalization) {
        this._fieldLocalizationIds.push(fieldLocalization.id);
    }
}