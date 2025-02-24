class Formation {
    constructor(name, fieldLocalizationIds, baseFormation) {
        this.name = name;
        this._fieldLocalizationIds = fieldLocalizationIds;
		this.baseFormation = baseFormation;
    }

	static all() {
		return Context.game.formations;
	}

    static create(name, fieldLocalizationNames) {
        const fieldLocalizations = fieldLocalizationNames.map(flName => FieldLocalization.getByName(flName.trim()));
		const fieldRegions = fieldLocalizations.map(fl => fl.position.fieldRegion);
		const baseFormation = Formation.getFormationName(fieldRegions);
        const formation = new Formation(name, fieldLocalizations.map(fl => fl.id), baseFormation);
        formation.id = Context.game.formations.push(formation);
        return formation;
    }

    static getById(id) {
        return Context.game.formations[id - 1];
    }

	static getBaseFormations() {
		return Formation.all().map(f => f.baseFormation).distinct();
	}

	//https://www.fifplay.com/fifa-23/formations/
    static seed() {
		Formation.create('3-1-4-2',          ['GK', 'LCB', 'CB ', 'RCB', 'CDM', 'LCM', 'RCM', 'LM ', 'RM ', 'LS ', 'RS']);
		Formation.create('3-4-1-2',          ['GK', 'LCB', 'CB ', 'RCB', 'LCM', 'RCM', 'LM ', 'RM ', 'CAM', 'LS ', 'RS']);

		Formation.create('3-4-3 Diamond',    ['GK', 'LCB', 'CB ', 'RCB', 'CDM', 'LM ', 'RM ', 'CAM', 'LW ', 'RW ', 'ST']);
		Formation.create('3-4-3 Flat',       ['GK', 'LCB', 'CB ', 'RCB', 'LCM', 'RCM', 'LM ', 'RM ', 'LW ', 'RW ', 'ST']);

		Formation.create('3-5-1-1',          ['GK', 'LCB', 'CB ', 'RCB', 'LDM', 'RDM', 'LM ', 'RM ', 'CAM', 'CF ', 'ST']);
		Formation.create('3-5-2',            ['GK', 'LCB', 'CB ', 'RCB', 'LDM', 'RDM', 'LM ', 'RM ', 'CAM', 'LS ', 'RS']);
		
		Formation.create('4-1-2-1-2 Narrow', ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LCM', 'RCM', 'CAM', 'LS ', 'RS']);
		Formation.create('4-1-2-1-2 Wide',   ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LM ', 'RM ', 'CAM', 'LS ', 'RS']);
		Formation.create('4-1-4-1',          ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LCM', 'RCM', 'LM ', 'RM ', 'ST']);
		Formation.create('4-2-2-2',          ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'LAM', 'RAM', 'LS ', 'RS']);

		Formation.create('4-2-3-1 Narrow',   ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'LAM', 'CAM', 'RAM', 'ST']);
		Formation.create('4-2-3-1 Wide',     ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'LM ', 'RM ', 'CAM', 'ST']);

		Formation.create('4-2-4',            ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'LW ', 'RW ', 'LS ', 'RS']);

		Formation.create('4-3-1-2',          ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'CM ', 'RCM', 'CAM', 'LS ', 'RS']);

		Formation.create('4-3-2-1',          ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'CM ', 'RCM', 'LF ', 'RF ', 'ST']);
		Formation.create('4-3-3 Attack',     ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'CAM', 'LW ', 'RW ', 'ST']);
		Formation.create('4-3-3 Defense',    ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'CM ', 'LW ', 'RW ', 'ST']);
		Formation.create('4-3-3 False 9',    ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LCM', 'RCM', 'LW ', 'RW ', 'CF']);
		Formation.create('4-3-3 Flat',       ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'CM ', 'RCM', 'LW ', 'RW ', 'ST']);
		Formation.create('4-3-3 Holding',    ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CDM', 'LCM', 'RCM', 'LW ', 'RW ', 'ST']);

		Formation.create('4-4-1-1 Attack',   ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'LM ', 'RM ', 'CF ', 'ST']);
		Formation.create('4-4-1-1 Midfield', ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'LM ', 'RM ', 'CAM', 'ST']);
		Formation.create('4-4-2 Flat',       ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'RCM', 'LM ', 'RM ', 'LS ', 'RS']);
		Formation.create('4-4-2 Holding',    ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LDM', 'RDM', 'LM ', 'RM ', 'LS ', 'RS']);
		
		Formation.create('4-5-1 Attack',     ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'CM ', 'LM ', 'RM ', 'LAM', 'RAM', 'ST']);
		Formation.create('4-5-1 Flat',       ['GK', 'LCB', 'RCB', 'LB ', 'RB ', 'LCM', 'CM ', 'RCM', 'LM ', 'RM ', 'ST']);
		
		Formation.create('5-1-2-2',          ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'CDM', 'LCM', 'RCM', 'LS ', 'RS']);
		Formation.create('5-2-1-2',          ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'LCM', 'RCM', 'CAM', 'LS ', 'RS']);
		
		Formation.create('5-2-3',            ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'LCM', 'RCM', 'LW ', 'RW ', 'ST']);
		
		Formation.create('5-3-2',            ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'LCM', 'CM ', 'RCM', 'LS ', 'RS']);
		
		Formation.create('5-4-1 Diamond',    ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'CDM', 'LM ', 'RM ', 'CAM', 'ST']);
		Formation.create('5-4-1 Flat',       ['GK', 'LCB', 'CB ', 'RCB', 'LWB', 'RWB', 'LCM', 'RCM', 'LM ', 'RM ', 'ST']);
	}

	static getFormationName(fieldRegions) {
		const defense = fieldRegions.filter(fr => fr.name === 'defense').length;
		const midfield = fieldRegions.filter(fr => fr.name === 'midfield').length;
		const attack = fieldRegions.filter(fr => fr.name === 'attack').length;

		return `${defense}-${midfield}-${attack}`;
	}

    get fieldLocalizations() {
        return Context.game.fieldLocalizations.filterByIds(this._fieldLocalizationIds);
    }

	get positions() {
		return this.fieldLocalizations.map(fl => fl.position);
	}

	getFieldRegionOccurrences(fieldRegion) {
		return this.positions.filter(p => p.fieldRegion.id === fieldRegion.id).length;
	}

	static getPositionsMap() {
		if (!Formation._positionsMap)
			Formation._positionsMap = new Map();
            const formations = Formation.all();
			for (const formation of formations)
				if (!Formation._positionsMap.has(formation))
					Formation._positionsMap.set(formation, formation.positions);
        return Formation._positionsMap;
	}
}