const Client = require("../models/client.models");
const User = require("../models/user.models");
const Site = require("../models/site.models");
const { convertToUser } = require("./user.controller");
const { addLedger } = require("./ledger.controller");
const { sendNotification } = require("./notification.controller.js");


const getClients = async (req, res) => {
  try {
    const clients = await Client.find()
    .populate("site.id")
    .sort({ name: 1 })
    .exec();
    if (!clients || clients.length === 0)
      return res.status(404).json({ message: "Clients Not Found" });
    res.status(200).json(clients);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getClient = async (req, res) => {
  try {
    const id = req.params.id;
    const client = await Client.findById(id).populate("site.id").exec();
    if (!client) return res.status(404).json({ message: "Client not Found" });
    return res.status(200).json(client);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const createClient = async (req, res) => {
  try {
    const { name, email, gstNo, phone, whatsapp, address, isUser, service } = req.body;

    const existingClient = await Client.findOne({ $or: [{ name }] });
    if (existingClient)
      return res
        .status(500)
        .json({ message: "Client already exists", existingClient });

    const newClient = await Client({
      name,
      email,
      gstNo,
      phone,
      whatsapp,
      address,
      isUser,
      service
    });

    const savedClient = await newClient.save();
    console.log(savedClient);
    if (!savedClient)
      return res.status(404).json({ message: "Something went wrong" });
    res.status(201).json({ message: "Client Created Successfuly" });
    // const isGSTApplicable = gstNo !== "" ? true : false;
    // addLedger(savedClient, "Sundry Debtor", isGSTApplicable, false, "client");
    if (savedClient.isUser === true) {
      const password = `${name}@${phone}`;
      await convertToUser(savedClient._id, "Client", password);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const convertToClient = async (req, res) => {
  try {
    const { name, email, gstNo, phone, whatsapp, address, isUser } = req.body;

    const existingClient = await Client.findOne({ $or: [{ name }] });
    if (existingClient)
      return res
        .status(500)
        .json({ message: "Client already exists", existingClient });

    const newClient = await Client({
      name,
      email,
      gstNo,
      phone,
      whatsapp,
      address,
      isUser,
    });

    const savedClient = await newClient.save();
    console.log(savedClient);
    if (!savedClient)
      return res.status(404).json({ message: "Something went wrong" });
    res.status(201).json({ message: "Client Created Successfuly" });
    // const isGSTApplicable = gstNo !== "" ? true : false;
    // addLedger(savedClient, "Sundry Debtor", isGSTApplicable, false, "client");
    if (savedClient.isUser === true) {
      const password = `${name}@${phone}`;
      await convertToUser(savedClient._id, "Client", password);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateClient = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, gstNo, phone, whatsapp, address, isUser } = req.body;
    const existingClient = await Client.findById(id);
    if (!existingClient)
      return res.status(404).json({ message: "Client not found" });

    (existingClient.name = name || existingClient?.name),
      (existingClient.email = email || existingClient?.email),
      (existingClient.gstNo = gstNo || existingClient?.gstNo),
      (existingClient.phone = phone || existingClient?.phone),
      (existingClient.whatsapp = whatsapp || existingClient?.whatsapp),
      (existingClient.address = address || existingClient?.address),
      (existingClient.isUser = isUser || existingClient?.isUser),
      await existingClient.save();
    res.json({ message: "Client updated successfully" });
    if (existingClient.isUser === true) {
      const password = `${name}@${phone}`;
      await convertToUser(existingClient._id, "Client", password);
      console.log('created user for client')
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteClient = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedClient = await Client.findOneAndDelete(id);

    if (!deletedClient)
      return res.status(404).json({ message: "Client not found" });

    res.status(201).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getClient,
  getClients,
  createClient,
  updateClient,
  deleteClient,
  convertToClient,
};
