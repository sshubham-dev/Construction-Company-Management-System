const Contra = require('../models/contra.models');
const { Ledger } = require('../models/ledger.models');

// Create Contra voucher
const createContra = async (req, res) => {
    try {
        // console.log(req.body)
        const { voucherNo, date, description, from, to, amount } = req.body;
        const fromAccount = await Ledger.findById(from)
        const toAccount = await Ledger.findById(to)
        const newContra = new Contra({
            voucherNo,
            date,
            description,
            from: {
                name: fromAccount.name,
                id: fromAccount._id,
            },
            to: {
                name: toAccount.name,
                id: toAccount._id,
            },
            amount,
        });
        const savedContra = await newContra.save();
        console.log(savedContra)
        fromAccount.paid = parseInt(fromAccount.paid) + parseInt(amount);
        fromAccount.balance = parseInt(fromAccount.balance) - parseInt(amount);
        fromAccount.transaction.push({id: savedContra._id, type:'Contra', amount})
        toAccount.transaction.push({id: savedContra._id, type:'Contra', amount})
        toAccount.received = parseInt(toAccount.received) + parseInt(amount);
        toAccount.balance = parseInt(toAccount.balance) + parseInt(amount);
        await fromAccount.save();
        await toAccount.save();
        res.status(201).json({ message: 'Contra voucher created successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating contra voucher' });
    }
};

// Get all Contra vouchers
const getAllContra = async (req, res) => {
    try {
        const contras = await Contra.find();
        res.status(200).json(contras);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching contra vouchers', error: error.message });
    }
};

// Get single Contra voucher by Id
const getContra = async (req, res) => {
    try {
        const id = req.params.id;
        const contra = await Contra.findById(id)
            .populate('fromAccount.id')
            .populate('toAccount.id')
            .populate('createdBy');

        if (!contra) {
            return res.status(404).json({ message: 'Contra voucher not found' });
        }
        res.status(200).json(contra);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching contra voucher', error: error.message });
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
        const { id } = req.params;
        const { date, description, fromAccount, toAccount, amount } = req.body;

        const updatedContra = await Contra.findByIdAndUpdate(
            id,
            { date, description, fromAccount, toAccount, amount },
            { new: true }
        ).populate('fromAccount.id').populate('toAccount.id').populate('createdBy');

        if (!updatedContra) {
            return res.status(404).json({ message: 'Contra voucher not found' });
        }

        res.status(200).json({ message: 'Contra voucher updated successfully'});
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating contra voucher', error: error.message });
    }
};

// Delete Contra voucher
const deleteContra = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedContra = await Contra.findByIdAndDelete(id);

        if (!deletedContra) {
            return res.status(404).json({ message: 'Contra voucher not found' });
        }

        res.status(200).json({ message: 'Contra voucher deleted successfully'});
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error deleting contra voucher', error: error.message });
    }
};

module.exports = { createContra, getAllContra, getContraByVoucherNo, updateContra, deleteContra, getContra }