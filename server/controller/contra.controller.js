const Contra = require('../models/contra.models');

// Create Contra voucher
const createContra = async (req, res) => {
    try {
        console.log(req.body)
        const {user} = req.user
        const { voucherNo, date, description, fromAccount, toAccount, amount, createdBy } = req.body;

        const newContra = new Contra({
            voucherNo,
            date,
            description,
            fromAccount,
            toAccount,
            amount,
            // createdBy: user._id,
        });

        await newContra.save();
        res.status(201).json({ message: 'Contra voucher created successfully', data: newContra });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating contra voucher', error: error.message });
    }
};

// Get all Contra vouchers
const getAllContra = async (req, res) => {
    try {
        const contras = await Contra.find().populate('fromAccount.id').populate('toAccount.id').populate('createdBy');
        res.status(200).json({ message: 'Contra vouchers retrieved successfully', data: contras });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching contra vouchers', error: error.message });
    }
};

// Get single Contra voucher by voucherNo
const getContraByVoucherNo = async (req, res) => {
    try {
        const contra = await Contra.findOne({ voucherNo: req.params.voucherNo })
            .populate('fromAccount.id')
            .populate('toAccount.id')
            .populate('createdBy');

        if (!contra) {
            return res.status(404).json({ message: 'Contra voucher not found' });
        }

        res.status(200).json({ message: 'Contra voucher retrieved successfully', data: contra });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching contra voucher', error: error.message });
    }
};

// Update Contra voucher
const updateContra = async (req, res) => {
    try {
        const { voucherNo } = req.params;
        const { date, description, fromAccount, toAccount, amount } = req.body;

        const updatedContra = await Contra.findOneAndUpdate(
            { voucherNo },
            { date, description, fromAccount, toAccount, amount },
            { new: true }
        ).populate('fromAccount.id').populate('toAccount.id').populate('createdBy');

        if (!updatedContra) {
            return res.status(404).json({ message: 'Contra voucher not found' });
        }

        res.status(200).json({ message: 'Contra voucher updated successfully', data: updatedContra });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating contra voucher', error: error.message });
    }
};

// Delete Contra voucher
const deleteContra = async (req, res) => {
    try {
        const { voucherNo } = req.params;

        const deletedContra = await Contra.findOneAndDelete({ voucherNo });

        if (!deletedContra) {
            return res.status(404).json({ message: 'Contra voucher not found' });
        }

        res.status(200).json({ message: 'Contra voucher deleted successfully', data: deletedContra });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error deleting contra voucher', error: error.message });
    }
};

module.exports = { createContra, getAllContra, getContraByVoucherNo, updateContra, deleteContra }