const Supplier = require('../models/supplier.models.js');

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        if(suppliers.length === '0') return res.status(404).json({ error: 'No Suppliers found' }); 
        res.status(200).json(suppliers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getSupplier = async (req, res) => {
    try {
        const  id  = req.params.id;
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
        const { name, contactNo, whatsapp, address, gst, pan, bank } = req.body;
        console.log(req.body)
        const newSupplier = new Supplier({
            name,
            contactNo,
            whatsapp,
            address,
            gst,
        });
        console.log(newSupplier)
        const savedSupplier = await newSupplier.save();
        res.status(201).json({message:'Supplier Created Successfully', savedSupplier});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const  _id  = req.params.id;
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            _id,
            req.body,
            { new: true }
        );
        if (!updatedSupplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.status(200).json({message:'Details Updated Successfully', updatedSupplier});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const  id  = req.params.id;
        const deletedSupplier = await Supplier.findByIdAndDelete(id);
        if (!deletedSupplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.status(204).json({message:'Supplier Deleted Successfully'}); // No content after successful deletion
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
