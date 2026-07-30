const {
    createGSTLedgerConfig,
    getGSTLedgerConfigs,
    getGSTLedgerConfigById,
    updateGSTLedgerConfig,
    deleteGSTLedgerConfig,
    getGSTConfig
} = require("../services/General/gstLedgerConfig.service");


const create = async (req, res) => {
    try {
        const result = await createGSTLedgerConfig(req.body);

        return res.status(201).json({
            success: true,
            message: "GST Ledger Configuration created successfully.",
            data: result,
        });
    } catch (error) {
        console.log(error)
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create GST Ledger Configuration.",
        });
    }
};

const getAll = async (req, res) => {
    try {
        const { companyId, gstType } = req.query;

        const result = await getGSTLedgerConfigs({
            companyId,
            gstType,
        });

        return res.status(200).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (error) {
        console.log(error)
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch GST Ledger Configurations.",
        });
    }
};

const getOne = async (req, res) => {
    try {
        const result = await getGSTLedgerConfigById(req.params.id);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error)
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "GST Ledger Configuration not found.",
        });
    }
};

const update = async (req, res) => {
    try {
        const result = await updateGSTLedgerConfig(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "GST Ledger Configuration updated successfully.",
            data: result,
        });
    } catch (error) {
        console.log(error)
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update GST Ledger Configuration.",
        });
    }
};

const remove = async (req, res) => {
    try {
        await deleteGSTLedgerConfig(req.params.id);

        return res.status(200).json({
            success: true,
            message: "GST Ledger Configuration deleted successfully.",
        });
    } catch (error) {
        console.log(error)
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete GST Ledger Configuration.",
        });
    }
};

const gstConfig = async (rea, res) => {
    try {
        const { companyId, gstType, rate } = req.query;

        const result = await getGSTConfig({
            companyId,
            gstType,
            rate
        });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error)
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch GST Ledger Configurations.",
        });
    }
}


module.exports = {
    create,
    getAll,
    getOne,
    update,
    remove,
    gstConfig,
};