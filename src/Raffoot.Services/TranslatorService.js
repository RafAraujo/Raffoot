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

        for (let word of array) {
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
        let name = championship.name;

        if (championship.championshipType.scope === 'national') {
            const cupTranslation = this.get("Cup");
            const leagueTranslation = this.get("League");
            const confederationTranslation = this.get(championship.confederation.name);

            name = name.replace(" Cup", ` ${cupTranslation}`);
            name = name.replace(" League", ` ${leagueTranslation}`);
            name = name.replace(championship.confederation.name, '');

            return `${confederationTranslation} - ${name}`;
        }
        else if (championship.name === 'World Cup') {
            return translator.get(championship.name);
        }

        return championship.name;
    }

    static getLanguage() {
        let availableLanguages = Object.getOwnPropertyNames(MultiLanguage);
        let browserLanguage = navigator.language || navigator.userLanguage;
        let language = availableLanguages.find(l => l === browserLanguage || browserLanguage.startsWith(l)) ?? "en";
        return language;
    }
}