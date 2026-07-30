const GSTLedgerConfig = require("../../models/GSTLedgerConfig.models");

/**
 * Create GST Ledger Configuration
 */
const createGSTLedgerConfig = async (data) => {
    const {
        companyId,
        gstType,
        rate,
    } = data;

    const exists = await GSTLedgerConfig.findOne({
        companyId,
        gstType,
        rate,
        isActive: true,
    });

    if (exists) {
        const error = new Error("GST Ledger Configuration already exists.");
        error.statusCode = 400;
        throw error;
    }

    const config = await GSTLedgerConfig.create(data);

    return config;
};

/**
 * Get All GST Ledger Configurations
 */
const getGSTLedgerConfigs = async ({
    companyId,
    gstType,
}) => {

    const filter = {
        isActive: true,
    };

    if (companyId) filter.companyId = companyId;
    if (gstType) filter.gstType = gstType;

    const configs = await GSTLedgerConfig.find(filter)
        .populate("purchase.intraState.cgstLedgerId", "name code")
        .populate("purchase.intraState.sgstLedgerId", "name code")
        .populate("purchase.interState.igstLedgerId", "name code")
        .populate("sales.intraState.cgstLedgerId", "name code")
        .populate("sales.intraState.sgstLedgerId", "name code")
        .populate("sales.interState.igstLedgerId", "name code")
        .sort({
            gstType: 1,
            rate: 1,
        });

    return configs;
};

/**
 * Get GST Configuration By Id
 */
const getGSTLedgerConfigById = async (id) => {

    const config = await GSTLedgerConfig.findById(id)
        .populate("purchase.intraState.cgstLedgerId", "name code")
        .populate("purchase.intraState.sgstLedgerId", "name code")
        .populate("purchase.interState.igstLedgerId", "name code")
        .populate("sales.intraState.cgstLedgerId", "name code")
        .populate("sales.intraState.sgstLedgerId", "name code")
        .populate("sales.interState.igstLedgerId", "name code");

    if (!config) {
        const error = new Error("GST Ledger Configuration not found.");
        error.statusCode = 404;
        throw error;
    }

    return config;
};

/**
 * Update GST Configuration
 */
const updateGSTLedgerConfig = async (
    id,
    data
) => {

    const config = await GSTLedgerConfig.findById(id);

    if (!config) {
        const error = new Error("GST Ledger Configuration not found.");
        error.statusCode = 404;
        throw error;
    }

    const duplicate = await GSTLedgerConfig.findOne({
        _id: { $ne: id },
        companyId: data.companyId,
        gstType: data.gstType,
        rate: data.rate,
        isActive: true,
    });

    if (duplicate) {
        const error = new Error("GST Ledger Configuration already exists.");
        error.statusCode = 400;
        throw error;
    }

    Object.assign(config, data);

    await config.save();

    return config;
};

/**
 * Soft Delete GST Configuration
 */
const deleteGSTLedgerConfig = async (id) => {

    const config = await GSTLedgerConfig.findById(id);

    if (!config) {
        const error = new Error("GST Ledger Configuration not found.");
        error.statusCode = 404;
        throw error;
    }

    config.isActive = false;

    await config.save();

    return true;
};

/**
 * ERP Helper
 * Used by Purchase / Sales / Voucher Engine
 */
const getGSTConfig = async ({
    companyId,
    gstType,
    rate,
}) => {

    const config = await GSTLedgerConfig.findOne({
        companyId,
        gstType,
        rate,
        isActive: true,
    });

    if (!config) {
        const error = new Error(
            `GST Configuration not found for ${gstType} (${rate}%)`
        );
        error.statusCode = 404;
        throw error;
    }

    return config;
};

module.exports = {
    createGSTLedgerConfig,
    getGSTLedgerConfigs,
    getGSTLedgerConfigById,
    updateGSTLedgerConfig,
    deleteGSTLedgerConfig,
    getGSTConfig,
};