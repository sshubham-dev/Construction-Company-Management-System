const AppError = require("../AppError");

class VoucherBuilder {

    constructor(precision = 2) {

        this.precision = precision;

        this.entryMap = new Map();

    }

    /**
     * Internal Add Entry
     */
    add({

        ledgerId,

        type,

        amount,

        costCenterId = null,

        referenceType = null,

        referenceId = null,

        remarks = ""

    }) {

        if (!ledgerId)
            throw new AppError("Ledger is required.");

        if (!["DR", "CR"].includes(type))
            throw new AppError("Invalid entry type.");

        amount = Number(amount || 0);

        if (amount <= 0)
            return this;

        const key = [
            ledgerId,
            type,
            costCenterId || "",
            referenceType || "",
            referenceId || ""
        ].join("_");

        if (this.entryMap.has(key)) {

            const entry = this.entryMap.get(key);

            entry.amount += amount;

        } else {

            this.entryMap.set(key, {

                ledgerId,

                type,

                amount,

                costCenterId,

                referenceType,

                referenceId,

                remarks

            });

        }

        return this;

    }

    /**
     * Debit Shortcut
     */
    debit(

        ledgerId,

        amount,

        costCenterId = null,

        referenceType = null,

        referenceId = null,

        remarks = ""

    ) {

        return this.add({

            ledgerId,

            type: "DR",

            amount,

            costCenterId,

            referenceType,

            referenceId,

            remarks

        });

    }

    /**
     * Credit Shortcut
     */
    credit(

        ledgerId,

        amount,

        costCenterId = null,

        referenceType = null,

        referenceId = null,

        remarks = ""

    ) {

        return this.add({

            ledgerId,

            type: "CR",

            amount,

            costCenterId,

            referenceType,

            referenceId,

            remarks

        });

    }

    /**
     * Build Final Entries
     */
    build() {

        return [...this.entryMap.values()].map(entry => ({

            ...entry,

            amount: Number(
                entry.amount.toFixed(this.precision)
            )

        }));

    }

    /**
     * Clear Builder
     */
    clear() {

        this.entryMap.clear();

        return this;

    }

}

module.exports = VoucherBuilder;