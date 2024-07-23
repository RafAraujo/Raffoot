class TranslatorService {
    constructor() {
        const languageAbbreviation = TranslatorService.getLanguage();
        this.language = MultiLanguage[languageAbbreviation];
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
        else {
            console.error(`Text "${text}" not found`)
            return text;
        }
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

    getChampionshipName(championship, includeDivision = true) {
        const championshipNameWithoutDivision = championship.name.replace(` ${championship.division}`, '');
        const translation = this.get(championshipNameWithoutDivision);
        return championship.championshipType.format === 'league' && includeDivision ? `${translation} ${championship.division}` : `${translation}`;
    }

    static getLanguage() {
        let availableLanguages = Object.getOwnPropertyNames(MultiLanguage);
        let browserLanguage = navigator.language || navigator.userLanguage;
        let language = availableLanguages.find(l => l === browserLanguage || browserLanguage.startsWith(l)) ?? "en";
        return language;
    }
}