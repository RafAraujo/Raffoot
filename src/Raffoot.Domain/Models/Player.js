class Player {
    static conditions = Object.keys(Config.player.conditions);

    constructor(name, countryId, positionId, age, overall, clubId, energy, externalId) {
        this.name = name;
        this._countryId = countryId;
        this._positionId = positionId;
        this.age = age;
        this.overall = overall;
        this._clubId = clubId;
        this.energy = energy;
        this.externalId = externalId;
    }

    static create(name, countryId, positionId, age, overall, externalId, club = null) {
        if (!club)
            club = Club.all().last();

        const energy = 100;
        const player = new Player(name, countryId, positionId, age, overall, club.id, energy, externalId);
        player.id = Context.game.players.push(player);

        club.addPlayer(player);

        return player;
    }

    static getById(id) {
        return Context.game.players[id - 1];
    }

    static getByName(name) {
        return Context.game.players.find(p => p.name === name);
    }

    static getCategory(overall) {
        return overall >= 80 ? 'gold' : overall >= 60 ? 'silver' : 'bronze';
    }

    static _getBaseWage(overall) {
        const baseWage = Player._calculateBaseWage(overall);
        const minimumWage = Player._getMinimumWage()
        return Math.max(baseWage, minimumWage);
    }

    static _getMinimumWage() {
        const wage = Player._calculateBaseWage(10, false);
        return wage;
    }

    static _calculateBaseWage(overall) {
        let wage = Math.pow(overall / 20, 9);
        const minimumValue = 2000;
        wage = Math.max(minimumValue, wage);
        return Math.round(wage);
    }

    static _calculateMarketValue(overall, age, position) {
        const reference = Math.pow(overall / 20, 10) * Math.pow(Math.log(overall), 2);
        const ageFactor = (32 - age) * reference * 0.1;
        const positionFactor = (position.line - 1) * (reference * 0.03);
        const minimumValue = 100 * 1000;
        const value = minimumValue + reference + ageFactor + positionFactor;
        return Math.round(value);
    }

    get category() {
        return Player.getCategory(this.overall);
    }

    get fieldLocalization() {
        return this._fieldLocalizationId ? FieldLocalization.getById(this._fieldLocalizationId) : null;
    }

    set fieldLocalization(value) {
        if (value)
            this._fieldLocalizationId = value.id;
        else
            delete this._fieldLocalizationId;
    }

    get club() {
        return Club.getById(this._clubId);
    }

    get conditionDescription() {
        const index = this.condition + 2;
        return ['A', 'B', 'C', 'D', 'E'][index];
    }

    get country() {
        return Country.getById(this._countryId);
    }

    get currentOverall() {
        return this._fieldLocalizationId ? this.calculateOverallAt(this.fieldLocalization) : this.overall;
    }

    get idealFieldLocalizations() {
        return this.position.fieldLocalizations;
    }

    get idealFormations() {
        return this.position.idealFormations;
    }

    get isImprovised() {
        return this.isOnField ? this._positionId != this.fieldLocalization.position.id : false;
    }

    get isInjured() {
        return Object.hasOwn(this, 'injury');
    }

    get isOnBench() {
        return this.fieldLocalization?.name === 'SUB';
    }

    get isOnField() {
        return this.fieldLocalization?.position ? true : false;
    }

    get isUnlisted() {
        return !this.fieldLocalization;
    }

    get marketValue() {
        return Player._calculateMarketValue(this.overall, this.age, this.position);
    }

    get position() {
        return Position.getById(this._positionId);
    }

    get recoveryDate() {
        return this.isInjured ? this.injury.date.addDays(this.injury.daysToRecover) : null;
    }
    
    get surname() {
        const array = this.name.split(' ');
        if (array.length > 1 && array[0].endsWith('.')) {
            array.shift();
            const name = array.join(' ');
            return name;
        }
        else {
            return this.name;
        }
    }

    get lastName() {
        return this.name.split(' ').last();
    }

    get wage() {
        return Player._getBaseWage(this.overall);
    }

    addChampionshipEditionPlayer(championshipEditionPlayer) {
        this._championshipEditionPlayers.push(championshipEditionPlayer.id);
    }

    calculateOverallAt(fieldLocalization) {
        if (this._positionId === fieldLocalization.position.id) {
            return this.overall;
        }
        else if (this.position.fieldLocalizations[0].line === fieldLocalization.line) {
            const overall = this.overall * 0.95;
            return Math.round(overall);
        }
        else {
            const nearestFieldLocalization = this.getNearestFieldLocalization(fieldLocalization);
            const distance = nearestFieldLocalization.calculateDistanceTo(fieldLocalization);
            const factor = nearestFieldLocalization.position.fieldRegion.id === fieldLocalization.position.fieldRegion.id ? 3 : 4;
            let overall = this.overall - distance * factor;
            if (fieldLocalization.position.isGoalkeeper)
                overall -= 20;
            overall = Math.round(overall);
            return Math.max(overall, 1);
        }
    }

    getNearestFieldLocalization(fieldLocalization) {
        if (this._positionId === fieldLocalization.position.id)
            return fieldLocalization;
    
        const results = this.idealFieldLocalizations
            .map(idealFieldLocalization => ({
                fieldLocalization: idealFieldLocalization,
                distance: idealFieldLocalization.calculateDistanceTo(fieldLocalization)
            }))
            .sort((a, b) => a.distance - b.distance);
        
        return results[0].fieldLocalization;
    }

    getPhotoURL() {
        const game = Context.game;
        const file = `${this.id}.png`;
        const url = `${Config.resourcesFolder}/image/data sources/${game.dataSource}/players/${game.firstYear}/${file}`;
        return url;
    }

    recover() {
        delete this.injury;
    }

    rest(days) {
        this.energy = Math.min(this.energy + days * 3, 100);
        this.energy = Math.round(this.energy);
    }

    setInjury(date, daysToRecover) {
        this.injury = { date, daysToRecover };
    }
}