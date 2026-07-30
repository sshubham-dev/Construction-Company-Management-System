const AppError = require("../AppError");

const round = (value, precision = 2) =>
    Number(Number(value || 0).toFixed(precision));

const validateEntries = (
    entries = [],
    precision = 2
) => {

    if (!Array.isArray(entries) || entries.length === 0)
        throw new AppError("Voucher must contain at least one entry.");

    let totalDebit = 0;
    let totalCredit = 0;

    let debitCount = 0;
    let creditCount = 0;

    for (const [index, entry] of entries.entries()) {

        if (!entry.ledgerId)
            throw new AppError(
                `Ledger is required for entry ${index + 1}.`
            );

        if (!["DR", "CR"].includes(entry.type))
            throw new AppError(
                `Invalid entry type for entry ${index + 1}.`
            );

        const amount = Number(entry.amount);

        if (Number.isNaN(amount))
            throw new AppError(
                `Invalid amount for entry ${index + 1}.`
            );

        if (amount <= 0)
            throw new AppError(
                `Amount must be greater than zero for entry ${index + 1}.`
            );

        if (entry.type === "DR") {

            debitCount++;

            totalDebit += amount;

        } else {

            creditCount++;

            totalCredit += amount;

        }

    }

    totalDebit = round(totalDebit, precision);
    totalCredit = round(totalCredit, precision);

    if (debitCount === 0)
        throw new AppError(
            "Voucher must contain at least one Debit entry."
        );

    if (creditCount === 0)
        throw new AppError(
            "Voucher must contain at least one Credit entry."
        );

    if (totalDebit !== totalCredit)
        throw new AppError(
            `Voucher is not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}.`
        );

    return {

        entries,

        totalDebit,

        totalCredit,

        totalEntries: entries.length

    };

};

module.exports = validateEntries;