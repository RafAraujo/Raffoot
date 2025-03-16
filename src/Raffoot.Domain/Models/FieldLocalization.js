class FieldLocalization {
	constructor(name, positionId, line, column) {
		this.name = name;
		this._positionId = positionId;
		this.line = line;
		this.column = column;
	}

	static create(name, positionAbbreviation, line, column) {
		const position = Position.all().find(p => p.abbreviation === positionAbbreviation);
		const fieldLocalization = new FieldLocalization(name, position == null ? null : position.id, line, column);
		fieldLocalization.id = Context.game.fieldLocalizations.push(fieldLocalization);
		if (position != null) {
			position.addFieldLocalization(fieldLocalization);
		}
		return fieldLocalization;
	}

	static all() {
		return Context.game.fieldLocalizations;
	}

	static getById(id) {
		return Context.game.fieldLocalizations[id - 1];
	}

	static getByName(name) {
		return Context.game.fieldLocalizations.find(fl => fl.name === name);
	}

	static seed() {
		FieldLocalization.create('GK', 'GK', 0, 2);
		FieldLocalization.create('LCB', 'CB', 1, 1);
		FieldLocalization.create('CB', 'CB', 1, 2);
		FieldLocalization.create('RCB', 'CB', 1, 3);
		FieldLocalization.create('LB', 'LB', 2, 0);
		FieldLocalization.create('RB', 'RB', 2, 4);
		FieldLocalization.create('LWB', 'LWB', 3, 0);
		FieldLocalization.create('RWB', 'RWB', 3, 4);
		FieldLocalization.create('LDM', 'CDM', 4, 1);
		FieldLocalization.create('CDM', 'CDM', 4, 2);
		FieldLocalization.create('RDM', 'CDM', 4, 3);
		FieldLocalization.create('LCM', 'CM', 5, 1);
		FieldLocalization.create('CM', 'CM', 5, 2);
		FieldLocalization.create('RCM', 'CM', 5, 3);
		FieldLocalization.create('LM', 'LM', 6, 0);
		FieldLocalization.create('RM', 'RM', 6, 4);
		FieldLocalization.create('LAM', 'CAM', 7, 1);
		FieldLocalization.create('CAM', 'CAM', 7, 2);
		FieldLocalization.create('RAM', 'CAM', 7, 3);
		FieldLocalization.create('LW', 'LW', 8, 0);
		FieldLocalization.create('RW', 'RW', 8, 4);
		FieldLocalization.create('LF', 'CF', 8, 1);
		FieldLocalization.create('CF', 'CF', 8, 2);
		FieldLocalization.create('RF', 'CF', 8, 3);
		FieldLocalization.create('LS', 'ST', 9, 1);
		FieldLocalization.create('ST', 'ST', 9, 2);
		FieldLocalization.create('RS', 'ST', 9, 3);
		FieldLocalization.create('SUB', null, null, null);
	}

	get isOffTheField() {
		return this.line === null;
	}

	get position() {
		return Position.getById(this._positionId);
	}

	get reverse() {
		return Context.game.fieldLocalizations.find(fl => fl.line === 11 - this.line && fl.column === 4 - this.column);
	}

	get side() {
		let sides = ['L', 'L', 'C', 'R', 'R'];
		return sides[this.column];
	}

	// https://stackoverflow.com/questions/20916953/get-distance-between-two-points-in-canvas
	calculateDistanceTo(fieldLocalization) {
		if (this.isOffTheField)
			return Number.MAX_VALUE;

		let x = this.line - fieldLocalization.line;
		let y = this.column - fieldLocalization.column;
		let distance = Math.hypot(x, y);
		return distance;
	}

	calculateDistanceToOpponent(fieldLocalization) {
		return this.calculateDistanceTo(fieldLocalization.reverse);
	}
}