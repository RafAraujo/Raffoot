class TranslatorService {
    constructor() {
        this.language = MultiLanguage[TranslatorService.getLanguage()]
    }

    get(text) {
        let translation = this.language[text];
        if (translation) {
            return translation;
        }

        translation = this.language[text.withOnlyFirstLetterUpperCase()];
        if (translation) {
            return translation;
        }

        throw new Error(`Text "${text}" not found`);
    }

    getAbbreviation(text) {
        let abbreviation = '';
        const translation = this.get(text);
        const array = translation.split(' ');

        for (const word of array) {
            if (word.length > 2) {
                abbreviation += word[0].toUpperCase();
            }
        }

        return abbreviation;
    }

    getFormationName(formation) {
        let name = formation?.name ?? '';

        const description = formation.name.split(' ').slice(1).join(' ');
        if (description) {
            const descriptionTranslation = this.get(description);
            name = name.replace(description, descriptionTranslation);
        }

        return name;
    }

    getChampionshipName(championship) {
        const championshipNameWithoutDivision = championship.name.replace(` ${championship.division}`, '');
        const translation = this.get(championshipNameWithoutDivision);
        return championship.championshipType.format === 'league' ? `${translation} ${championship.division}` : `${translation}`;
    }

    static getLanguage() {
        let availableLanguages = Object.getOwnPropertyNames(MultiLanguage);
        let browserLanguage = navigator.language || navigator.userLanguage;
        let language = availableLanguages.find(l => l === browserLanguage || browserLanguage.startsWith(l)) ?? "en";
        return language;
    }
}