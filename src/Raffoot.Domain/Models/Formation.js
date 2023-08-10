class Formation {
    constructor(name, fieldLocalizationIds, baseFormation) {
        this.name = name;
        this._fieldLocalizationIds = fieldLocalizationIds;
		this.baseFormation = baseFormation;
    }

    static create(name, fieldLocalizationNames, baseFormation) {
        const fieldLocalizationIds = fieldLocalizationNames.map(flName => Context.game.fieldLocalizations.find(fl => fl.name === flName.trim()).id);
        const formation = new Formation(name, fieldLocalizationIds, baseFormation);
        formation.id = Context.game.formations.push(formation);
        return formation;
    }

    static getById(id) {
        return Context.game.formations[id - 1];
    }

	//https://www.fifplay.com/fifa-23/formations/
    static seed() {
		Formation.create('3-1-4-2',          ['GK', 'LCB', 'CB ', 'RCB', 'CDM', 'LCM', 'RCM', 'LM ', 'RM ', 'LS ', 'RS'], '3-5-2');
		Formation.create('3-4-1-2',          ['GK', 'LCB', 'CB ', 'RCB', 'LCM', 'RCM', 'LM ', 'RM ', 'CAM', 'LS ', 'RS'], '3-5-2');

		Formation.create('3-4-3 Diamond',    ['GK', 'LCB', 'CB ', 'RCB', 'CDM', 'LM ', 'RM ', 'CAM', 'LW ', 'RW ', 'ST'], '3-4-3');
		Formation.create('3-4-3 Flat',       ['GK', 'LCB', 'CB ', 'RCB', 'LCM', 'RCM', 'LM ', 'RM ', 'LW ', 'RW ', 'ST'], '3-4-3');

		Formation.create('3-5-1-1',          ['GK', 'LCB', 'CB ', 'RCB', 'LDM', 'RDM', 'LM ', 'RM ', 'CAM', 'CF ', 'ST'], '3-5-2');
		Formation.create('3-5-2',            ['GK', 'LCB', 'CB ', 'RCB', 'LDM', 'RDM', 'LM ', 'RM ', 'CAM', 'LS ', 'RS'], '3-5-2');
		
		Formation.create('4-1-2-1-2 Narrow', ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LCM', 'RCM', 'CAM', 'LS ', 'RS'], '4-4-2');
		Formation.create('4-1-2-1-2 Wide',   ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LM ', 'RM ', 'CAM', 'LS ', 'RS'], '4-4-2');
		Formation.create('4-1-4-1',          ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LCM', 'RCM', 'LW ', 'RW ', 'ST'], '4-4-2');
		Formation.create('4-2-2-2',          ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'LAM', 'RAM', 'LS ', 'RS'], '4-4-2');

		Formation.create('4-2-3-1 Narrow',   ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'LAM', 'CAM', 'RAM', 'ST'], '4-5-1');
		Formation.create('4-2-3-1 Wide',     ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'LM ', 'RM ', 'CAM', 'ST'], '4-5-1');

		Formation.create('4-2-4',            ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'LW ', 'RW ', 'LS ', 'RS'], '4-2-4');

		Formation.create('4-3-1-2',          ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'CM ', 'RCM', 'CAM', 'LS ', 'RS'], '4-4-2');

		Formation.create('4-3-2-1',          ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'CM ', 'RCM', 'LF ', 'RF ', 'ST'], '4-3-3');
		Formation.create('4-3-3 Attack',     ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'CAM', 'LW ', 'RW ', 'ST'], '4-3-3');
		Formation.create('4-3-3 Defense',     ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'CM ', 'LW ', 'RW ', 'ST'], '4-3-3');
		Formation.create('4-3-3 False 9',    ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LCM', 'RCM', 'LW ', 'RW ', 'CF'], '4-3-3');
		Formation.create('4-3-3 Flat',       ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'CM ', 'RCM', 'LW ', 'RW ', 'ST'], '4-3-3');
		Formation.create('4-3-3 Holding',    ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LCM', 'RCM', 'LW ', 'RW ', 'ST'], '4-3-3');

		Formation.create('4-4-1-1 Attack',   ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'LM ', 'RM ', 'CF ', 'ST'], '4-4-2');
		Formation.create('4-4-1-1 Midfield', ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'LM ', 'RM ', 'CAM', 'ST'], '4-4-2');
		Formation.create('4-4-2 Flat',       ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'LM ', 'RM ', 'LS ', 'RS'], '4-4-2');
		Formation.create('4-4-2 Holding',    ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'LM ', 'RM ', 'LS ', 'RS'], '4-4-2');
		
		Formation.create('4-5-1 Attack',     ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CM ', 'LM ', 'RM ', 'LAM', 'RAM', 'ST'], '4-5-1');
		Formation.create('4-5-1 Flat',       ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'CM ', 'RCM', 'LM ', 'RM ', 'ST'], '4-5-1');
		
		Formation.create('5-1-2-2',          ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'CDM', 'LCM', 'RCM', 'LS ', 'RS'], '5-3-2');
		Formation.create('5-2-1-2',          ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'LCM', 'RCM', 'CAM', 'LS ', 'RS'], '5-3-2');
		
		Formation.create('5-2-3',            ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'LCM', 'RCM', 'LW ', 'RW ', 'ST'], '5-2-3');
		
		Formation.create('5-3-2',            ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'LCM', 'CM ', 'RCM', 'LS ', 'RS'], '5-3-2');
		
		Formation.create('5-4-1 Diamond',    ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'CDM', 'LM ', 'RM ', 'CAM', 'ST'], '5-4-1');
		Formation.create('5-4-1 Flat',       ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'LCM', 'RCM', 'LM ', 'RM ', 'ST'], '5-4-1');
	}

    get fieldLocalizations() {
        return Context.game.fieldLocalizations.filterByIds(this._fieldLocalizationIds);
    }

	get positions() {
		return this.fieldLocalizations.map(fl => fl.position);
	}

	filterFieldLocalizations(fieldRegion) {
		return this.fieldLocalizations.filter(fl => fl.position.fieldRegion === fieldRegion);
	}
}