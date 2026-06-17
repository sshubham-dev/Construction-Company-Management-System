const getFinancialYear = (date) => {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    let startYear;

    if (month >= 4) {
        startYear = year;
    } else {
        startYear = year - 1;
    }

    return {
        startYear,
        endYear: startYear + 1,
        code: `${String(startYear).slice(-2)}-${String(startYear + 1).slice(-2)}`,
        label: `${startYear}-${startYear + 1}`,
    };
};

module.exports = getFinancialYear;