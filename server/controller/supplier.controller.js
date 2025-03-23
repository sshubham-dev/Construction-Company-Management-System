const Supplier = require('../models/supplier.models.js');
const User = require('../models/user.models.js');
const { addLedger } = require('./ledger.controller.js');
const { convertToUser } = require('./user.controller.js');

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        if (suppliers.length === '0') return res.status(404).json({ error: 'No Suppliers found' });
        res.status(200).json(suppliers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getSupplier = async (req, res) => {
    try {
        const id = req.params.id;
        const supplier = await Supplier.findById(id);
        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.status(200).json(supplier);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createSupplier = async (req, res) => {
    try {
        const { name, email, phone, whatsapp, address, gstNo, bank, isUser } = req.body;
        console.log(req.body)
        const newSupplier = new Supplier({
            name,
            email,
            phone,
            whatsapp,
            address,
            gstNo,
            isUser,
        });
        console.log(newSupplier)
        const savedSupplier = await newSupplier.save();
        res.status(201).json({ message: 'Supplier Created Successfully', savedSupplier });
        const isGSTApplicable = gstNo !== '' ? true : false;
        addLedger(savedContractor, 'Sundry Creditor', isGSTApplicable, false, 'supplier')
        if (savedSupplier.isUser === true) {
            const password = name + '@' + phone
            await convertToUser(savedSupplier._id, 'Supplier', password);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const _id = req.params.id;
        const { name, email, phone, whatsapp, address, gstNo, bank, isUser } = req.body;
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            _id,
            req.body,
            { new: true }
        );
        if (!updatedSupplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.status(200).json({ message: 'Details Updated Successfully', updatedSupplier });
        if (updatedSupplier.isUser === true && updatedSupplier.userId === '') {
            console.log(isUser)
            const password = `${name}@${phone}`;
            await convertToUser(updatedSupplier._id, 'Supplier', password);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const id = req.params.id;
        const existingSupplier = await Supplier.findByIdAndDelete(id);
        if (!existingSupplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        const existingUser = await User.findByIdAndDelete(existingSupplier.userId);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(204).json({ message: 'Supplier Deleted Successfully' }); // No content after successful deletion
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getSupplier,
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
};
