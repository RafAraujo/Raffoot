String.prototype.equals = function (value, ignoreCase) {
    return ignoreCase ? this.toLowerCase() === value.toLowerCase() : this === value
};

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

String.prototype.htmlDecode = function () {
    return this.replace('&amp;#39;', "'").replace('&#34;', '\\').replace('&#39;', "'");
}

String.prototype.removeAccents = function () {
    return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

String.prototype.toTitleCase = function () {
    return this.split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join(' ');
};

String.prototype.withOnlyFirstLetterUpperCase = function () {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
}