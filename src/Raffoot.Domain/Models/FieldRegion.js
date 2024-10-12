class FieldRegion {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this._positionIds = [];
    }

    static create(name, color) {
        const fieldRegion = new FieldRegion(name, color);
        fieldRegion.id = Context.game.fieldRegions.push(fieldRegion);
        return fieldRegion;
    }

    static getById(id) {
        return Context.game.fieldRegions[id - 1];
    }

    static getByName(name) {
        return Context.game.fieldRegions.find(fr => fr.name === name);
    }

    static seed() {
        FieldRegion.create('goal', 'yellow');
        FieldRegion.create('defense', 'blue');
        FieldRegion.create('midfield', 'green');
        FieldRegion.create('attack', 'red');
    }

    get colorClass() {
        return Config.colors[this.color].class;
    }

    get fieldLocalizations() {
        return this.positions.flatMap(p => p.fieldLocalizations);
    }

    get inverse() {
        switch (this.name) {
            case 'goal':
            case 'defense':
                return FieldRegion.getByName('attack');
            case 'midfield':
                return this;
            case 'attack':
                return FieldRegion.getByName('defense');
        }
    }

    get positions() {
        return Context.game.positions.filterByIds(this._positionIds);
    }

    addPosition(position) {
        this._positionIds.push(position.id);
    }
}