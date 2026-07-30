const mongoose = require("mongoose");

const GSTLedgerConfigSchema = new mongoose.Schema(
    {
        rate: {
            type: Number,
            required: true,
            enum: [0, 5, 12, 18, 28],
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        gstType: {
            type: String,
            enum: ["GOODS", "SERVICE"],
            required: true,
        },

        purchase: {

            intraState: {
                cgstRate: Number,
                sgstRate: Number,

                cgstLedgerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Ledger",
                },

                sgstLedgerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Ledger",
                },
            },

            interState: {
                igstRate: Number,
                igstLedgerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Ledger",
                },
            },
        },

        sales: {

            intraState: {
                cgstRate: Number,
                sgstRate: Number,

                cgstLedgerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Ledger",
                },

                sgstLedgerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Ledger",
                },
            },

            interState: {
                igstRate: Number,
                igstLedgerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Ledger",
                },
            },
        },
    }, { timestamps: true });

GSTLedgerConfigSchema.index(
    {
        companyId: 1,
        gstType: 1,
        rate: 1,
    },
    {
        unique: true,
    }
);

const GSTLedgerConfig = mongoose.model("GSTLedgerConfig", GSTLedgerConfigSchema);
module.exports = GSTLedgerConfig;