const Supplier = require('../models/supplier.models.js');
const User = require('../models/user.models.js');
const { addLedger } = require('./ledger.controller.js');
const { convertToUser } = require('./user.controller.js');
const {sendPushNotification, notifyRole} = require("../utils/pushNotification.js");

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find()
        .sort({ name: 1 })
        .exec();
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
           const user = req.user;
        const newSupplier = new Supplier({
            name,
            email,
            phone,
            whatsapp,
            address,
            gstNo,
            isUser,
            companyId: user.companyId,
        });
        console.log(newSupplier)
        const savedSupplier = await newSupplier.save();
        res.status(201).json({ message: 'Supplier Created Successfully', savedSupplier });
        // const isGSTApplicable = gstNo !== '' ? true : false;
        // addLedger(savedContractor, 'Sundry Creditor', isGSTApplicable, false, 'supplier')
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
        const id = req.params.id;
        const {
            name,
            email,
            phone,
            whatsapp,
            address,
            gstNo,
            bank,
            isUser,
        } = req.body;
        const user = req.user;

        const supplier = await Supplier.findById(id);
        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        // 🛠 Update fields
        supplier.name = name?.trim() || supplier.name;
        supplier.email = email?.trim() || supplier.email;
        supplier.phone = phone?.trim() || supplier.phone;
        supplier.whatsapp = whatsapp?.trim() || supplier.whatsapp;
        supplier.address = address || supplier.address;
        supplier.gstNo = gstNo?.trim() || supplier.gstNo;
        supplier.bank = bank || supplier.bank;
        supplier.companyId = user.companyId || supplier.companyId;
        supplier.isUser = isUser === true || isUser === 'true';

        const updatedSupplier = await supplier.save(); // 💥 Triggers hooks

        // 🔐 Convert to user if needed
        if (updatedSupplier.isUser && !updatedSupplier.userId) {
            const password = `${updatedSupplier.name}@${updatedSupplier.phone}`;
            await convertToUser(updatedSupplier._id, 'Supplier', password);
        }

        return res.status(200).json({
            message: 'Details Updated Successfully',
            updatedSupplier,
        });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const deleteSupplier = async (req, res) => {
    try {
        const id = req.params.id;
        const existingSupplier = await Supplier.findById(id);
        if (!existingSupplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        existingSupplier.status = 'Inactive';
        await existingSupplier.save();
        const existingUser = await User.findById(existingSupplier.userId);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        existingUser.status = 'Inactive';
        await existingUser.save();
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
