const mongoose = require("mongoose"); ``

const fiscalYearSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        isClosed: {
            type: Boolean,
            default: false,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    }, { timestamps: true, });

/*
ONE ACTIVE FY PER COMPANY
*/
fiscalYearSchema.index(
    {
        company: 1,
        startDate: 1,
        endDate: 1
    }
);

/*
DATE VALIDATION
*/
fiscalYearSchema.pre("validate", function () {
    if (this.startDate >= this.endDate) {
        return new Error("End date must be after start date")
    }

});

const FiscalYear = mongoose.model(
    "FiscalYear",
    fiscalYearSchema
);

module.exports = FiscalYear;