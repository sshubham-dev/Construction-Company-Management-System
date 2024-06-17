const Client = require('../models/client.models');
const User = require('../models/user.models');
const Site = require('../models/site.models');


const getClients = async (req, res) => {
    try {
        const clients = await Client.find()
            .populate('site')
            .exec();
        if (!clients || clients.length === 0) return res.status(404).json({ message: 'Clients Not Found' });
        res.status(200).json(clients);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const getClient = async (req, res) => {
    try {
        const id = req.params.id;
        const client = await Client.findById(id)
            .populate('site')
            .exec();
        if (!client) return res.status(404).json({ message: 'Client not Found' });
        return res.status(200).json(client);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const createClient = async (req, res) => {
    try {
        const { name, email, gstNo, contactNo, whatsapp, address } = req.body;

        const existingUser = await User.findById(name);
        if (!existingUser) return res.status(404).json({ message: 'User not Found' });

        const existingClient = await Client.findOne({ $or: [{ name: existingUser?.userName }, { userId: existingUser?._id }] });
        if (existingClient) return res.status(500).json({ message: 'Client already exists', existingClient });

        const newClient = await Client({
            userId: existingUser?._id,
            name: existingUser?.userName,
            email,
            gstNo,
            contactNo,
            whatsapp,
            address,
        });
        const savedClient = await newClient.save();
        console.log(savedClient)
        if (!savedClient) return res.status(404).json({ message: 'Something went wrong' });
        res.status(201).json({ message: 'Client Created Successfuly' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const updateClient = async (req, res) => {
    try {
        const id = req.params.id;
        const { userId, name, email, gstNo, password, contactNo, whatsapp, address } = req.body;
        const userExist = await User.findById(name);
        if (!userExist) return res.status(404).json({ message: 'User not Found' });

        const existingClient = await Client.findById(id);
        if (!existingClient) return res.status(404).json({ message: 'Client not found' });

        existingClient.userId = userExist._id || existingClient?.userId,
            existingClient.name = userExist?.userName || existingClient?.name,
            existingClient.email = email || existingClient?.email,
            existingClient.gstNo = gstNo || existingClient?.gstNo,
            existingClient.contactNo = contactNo || existingClient?.contactNo,
            existingClient.whatsapp = whatsapp || existingClient?.whatsapp,
            existingClient.address = address || existingClient?.address,
            await existingClient.save();


        res.json({ message: 'Client updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const deleteClient = async (req, res) => {
    try {
        const id = req.params.id;

        const deletedClient = await Client.findOneAndDelete(id);

        if (!deletedClient) return res.status(404).json({ message: 'Client not found' });

        res.status(201).json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { getClient, getClients, createClient, updateClient, deleteClient };