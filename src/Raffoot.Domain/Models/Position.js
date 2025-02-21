class Position {
    constructor(name, abbreviation, fieldRegionId) {
        this.name = name;
        this.abbreviation = abbreviation;
        this._fieldRegionId = fieldRegionId;
        this._fieldLocalizationIds = [];
    }

    static all() {
        return Context.game.positions;
    }

    static create(name, abbreviation, fieldRegion) {
        const position = new Position(name, abbreviation, fieldRegion.id);
        position.id = Context.game.positions.push(position);

        fieldRegion.addPosition(position);

        return position;
    }

    static getById(id) {
        return Context.game.positions[id - 1];
    }

    static getByAbbreviation(abbreviation) {
        return Context.game.positions.find(p => p.abbreviation === abbreviation);
    }

    // https://fifauteam.com/fifa-23-positions-guide/
    static seed() {
        const goal = FieldRegion.getByName('goal');
        const defense = FieldRegion.getByName('defense');
        const midfield = FieldRegion.getByName('midfield');
        const attack = FieldRegion.getByName('attack');

		Position.create('Goalkeeper', 'GK', goal);
		Position.create('Centre-Back', 'CB', defense);
		Position.create('Left-Back', 'LB', defense);
		Position.create('Right-Back', 'RB', defense);
		Position.create('Left Wing-Back', 'LWB', defense);
		Position.create('Right Wing-Back', 'RWB', defense);
		Position.create('Defensive Midfielder', 'CDM', midfield);
		Position.create('Centre Midfielder', 'CM', midfield);
		Position.create('Left Midfielder', 'LM', midfield);
		Position.create('Right Midfielder', 'RM', midfield);
		Position.create('Attacking Midfielder', 'CAM', midfield);
		Position.create('Left Winger', 'LW', attack);
		Position.create('Right Winger', 'RW', attack);
		Position.create('Centre Forward', 'CF', attack);
		Position.create('Striker', 'ST', attack);
	}

    get fieldRegion() {
        return FieldRegion.getById(this._fieldRegionId);
    }

    get fieldLocalizations() {
        return Context.game.fieldLocalizations.filterByIds(this._fieldLocalizationIds);
    }

    get idealFormations() {
        return Formation.all().filter(f => f.positions.map(p => p.id).includes(this.id));
    }

    get isGoalkeeper() {
        return this.name === 'Goalkeeper';
    }

    get line() {
        return this.fieldLocalizations[0].line;
    }

    addFieldLocalization(fieldLocalization) {
        this._fieldLocalizationIds.push(fieldLocalization.id);
    }
}