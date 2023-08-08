const _currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
    roundingIncrement: 5,
});

Number.prototype.formatCurrency = function () {
    return _currencyFormatter.format(this);
}