Date.daysInMonth = function (month, year) {
    const date = new Date(year, month, 1);
    date.setMonth(month + 1);
    date.setDate(0);
    return date.getDate();
};

Date.firstDayCurrentYear = () => {
    const date = new Date();
    date.setMonth(0);
    date.setDate(1);
    return date;
};

Date.firstSunday = (month, year) => {
    const date = new Date(year, month, 1);
    const day = date.getDay();
    if (day !== 0)
        date.setDate(date.getDate() + (7 - day));
    return date;
};

Date.calculateAge = (birth, currentDate) => {
    const age = currentDate.getFullYear() - birth.getFullYear();
    const month = currentDate.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && currentDate.getDate() < birth.getDate()))
        age--;
    return age;
};

Date.daysDiff = (d1, d2) => {
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

Date.monthsDiff = (d1, d2) => {
    const months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months > 0 ? months++ : 0;
};

Date.prototype.addDays = function (value) {
    const date = new Date(this.valueOf());
    date.setDate(this.getDate() + value);
    return date;
};

Date.prototype.addMonths = function (value) {
    const date = new Date(this.valueOf());
    date.setMonth(this.getMonth() + value);
    return date;
};