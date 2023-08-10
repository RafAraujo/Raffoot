class FieldLocalization {
	constructor(name, positionId, line, column) {
		this.name = name;
		this._positionId = positionId;
		this.line = line;
		this.column = column;
	}

	static create(name, positionAbbreviation, line, column) {
		const position = Context.game.positions.find(p => p.abbreviation === positionAbbreviation);
		const fieldLocalization = new FieldLocalization(name, position == null ? null : position.id, line, column);
		fieldLocalization.id = Context.game.fieldLocalizations.push(fieldLocalization);
		if (position != null) {
			position.addFieldLocalization(fieldLocalization);
		}
		return fieldLocalization;
	}

	static getById(id) {
		return Context.game.fieldLocalizations[id - 1];
	}

	static getByName(name) {
		return Context.game.fieldLocalizations.find(fl => fl.name === name);
	}

	static seed() {
		FieldLocalization.create('GK', 'GK', 0, 2);
		FieldLocalization.create('LCB', 'CB', 2, 1);
		FieldLocalization.create('CB', 'CB', 2, 2);
		FieldLocalization.create('RCB', 'CB', 2, 3);
		FieldLocalization.create('LB', 'LB', 3, 0);
		FieldLocalization.create('RB', 'RB', 3, 4);
		FieldLocalization.create('LWB', 'LWB', 4, 0);
		FieldLocalization.create('RWB', 'RWB', 4, 4);
		FieldLocalization.create('LDM', 'CDM', 5, 1);
		FieldLocalization.create('CDM', 'CDM', 5, 2);
		FieldLocalization.create('RDM', 'CDM', 5, 3);
		FieldLocalization.create('LCM', 'CM', 6, 1);
		FieldLocalization.create('CM', 'CM', 6, 2);
		FieldLocalization.create('RCM', 'CM', 6, 3);
		FieldLocalization.create('LM', 'LM', 7, 0);
		FieldLocalization.create('RM', 'RM', 7, 4);
		FieldLocalization.create('LAM', 'CAM', 8, 1);
		FieldLocalization.create('CAM', 'CAM', 8, 2);
		FieldLocalization.create('RAM', 'CAM', 8, 3);
		FieldLocalization.create('LW', 'LW', 9, 0);
		FieldLocalization.create('RW', 'RW', 9, 4);
		FieldLocalization.create('LF', 'CF', 10, 1);
		FieldLocalization.create('CF', 'CF', 10, 2);
		FieldLocalization.create('RF', 'CF', 10, 3);
		FieldLocalization.create('LS', 'ST', 11, 1);
		FieldLocalization.create('ST', 'ST', 11, 2);
		FieldLocalization.create('RS', 'ST', 11, 3);
		FieldLocalization.create('SUB', null, null, null);
		FieldLocalization.create('RES', null, null, null);
	}

	static isGoalkeeper() {
		return _fieldLocalizations[0];
	}

	get position() {
		return Position.getById(this._positionId);
	}

	get side() {
		let sides = ['L', 'L', 'C', 'R', 'R'];
		return sides[this.column];
	}

	get reverse() {
		return new FieldLocalization(this.position.id, 11 - this.line, this.column === 2 ? 2 : 5 - this.column, this.name);
	}

	get isOffTheField() {
		return this.line === null;
	}

	getStyleLeftTop() {

	}

	// https://stackoverflow.com/questions/20916953/get-distance-between-two-points-in-canvas
	calculateDistanceTo(fieldLocalization) {
		if (this.isOffTheField) {
			return Number.MAX_VALUE;
		}

		let x = this.line - fieldLocalization.line;
		let y = this.column - fieldLocalization.column;
		let distance = Math.hypot(x, y);
		return distance;
	}

	calculateDistanceToOpponent(fieldLocalization) {
		return this.calculateDistanceTo(fieldLocalization.reverse);
	}
}