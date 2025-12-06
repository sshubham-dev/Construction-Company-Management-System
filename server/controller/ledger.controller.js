const { Ledger, Group, CostCenter } = require('../models/ledger.models');
const Site = require('../models/site.models');
const Client = require('../models/client.models');
const Contractor = require('../models/contractor.models');
const Supplier = require('../models/supplier.models');
const Employee = require('../models/employee.models');
const { sendNotification } = require("./notification.controller.js");

// CRUD for Ledger
const createLedger = async (req, res) => {
  try {
    const {
      name,
      alias,
      under,
      statutoryDetails,
      mailingDetails,
      taxRegistrationDetails,
      bankingDetails,
      openingBalance,
      refrenceType,
      refrenceId,
      createCostCenter
    } = req.body;

    // Step 1: Create the ledger
    const ledger = new Ledger({
      name,
      alias,
      under,
      statutoryDetails,
      mailingDetails,
      taxRegistrationDetails,
      bankingDetails,
      openingBalance,
      balance: openingBalance,
      paid: 0,
      receivable: 0,
      payable: 0,
      received: 0,
      refrenceType,
      refrenceId,
    });

    await ledger.save();

    // Step 2: Map ledger ID to the referenced model
    const mapLedger = async (Model) => {
      await Model.findByIdAndUpdate(refrenceId, { ledger: ledger._id });
    };

    switch (refrenceType) {
      case "Client":
        await mapLedger(Client);
        break;
      case "Site":
        await mapLedger(Site);
        break;
      case "Contractor":
        await mapLedger(Contractor);
        break;
      case "Supplier":
        await mapLedger(Supplier);
        break;
      case "Employee":
        await mapLedger(Employee);
        break;
    }

    // Step 3: Optional - Create cost center
    if (createCostCenter) {
      const costCenter = new CostCenter({
        name,
        alias,
        isPrimary: true,
        description: `Auto-created from ledger: ${name}`,
      });
      await costCenter.save();
    }

    res.status(201).json(ledger);
  } catch (error) {
    console.error("Ledger creation error:", error);
    res.status(500).json({ error: error.message });
  }
};

const addLedger = async (data, under, gst, tds, type) => {
  try {
    const ledger = new Ledger({
      name: data.name,
      alias: data.name,
      under,
      refrenceType: type,
      refrenceId: data._id,
      statutoryDetails: {
        isTDSDeductible: tds,
        isGSTApplicable: gst,
      },
      mailingDetails: {
        name: data.name,
        address: `${data.address.street}, ${data.address.city}, ${data.address.district}`,
        state: data.address.state,
      },
      taxRegistrationDetails: {
        panNo: data.pan,
        gstin: data.gstNo,
      },
      bankingDetails: {
        name: data.name,
        acNo: '',
        ifscCode: '',
        bankname: '',
        branch: '',
      },
      openingBalance: 0,
      balance: 0,
    });

    await ledger.save();
  } catch (error) {
    console.log(error);
  }
};

const getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find();
    res.json(ledgers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLedgerById = async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ message: "Ledger not found" });
    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const mapLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const { refrenceId, refrenceType } = req.body;
    if (!refrenceType) throw new Error("Reference type is required");

    const ledger = await Ledger.findById(id);
    ledger.refrenceId = refrenceId;
    ledger.refrenceType = refrenceType;

    switch (refrenceType) {
      case "Employee":
        await Employee.findByIdAndUpdate(refrenceId, { ledger: ledger._id });
        break;
      case "Client":
        await Client.findByIdAndUpdate(refrenceId, { ledger: ledger._id });
        break;
      case "Site":
        await Site.findByIdAndUpdate(refrenceId, { ledger: ledger._id });
        break;
      case "Contractor":
        await Contractor.findByIdAndUpdate(refrenceId, { ledger: ledger._id });
        break;
      case "Supplier":
        await Supplier.findByIdAndUpdate(refrenceId, { ledger: ledger._id });
        break;
      default:
        throw new Error("Invalid reference type");
    }

    await ledger.save();
    return res.status(200).json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteLedger = async (req, res) => {
  try {
    await Ledger.findByIdAndDelete(req.params.id);
    res.json({ message: "Ledger deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CRUD for Group
const createGroup = async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addLedgerAndCostCenterForSite = async (site) => {

  // inside addLedgerAndCostCenterForSite()
const existingCostCenter = await CostCenter.findOne({ name: site.name });
const existingLedger = await Ledger.findOne({ name: site.name });

if (existingCostCenter) {
  console.log(`[Site Ledger Sync] Cost center already exists for ${site.name}`);
  existingCostCenter.referenceId = site._id;
  existingCostCenter.mailingDetails = { name: site.name, address: site.address };
  await existingCostCenter.save();
} else {
    const ledger = new Ledger({
    name: site.name,
    refrenceType: 'Site',
    refrenceId: site._id,
    alias: site.siteId,
    under: 'Project Accounts',
    mailingDetails: {
      name: site.name,
      address: site.address,
      state: 'NA',
    },
    openingBalance: 0,
    payable: 0,
    receivable: 0,
    paid: 0,
    received: 0,
    balance: 0,
  });
  await ledger.save();
  site.ledger = ledger._id;
  await site.save();

  const costCenter = new CostCenter({
    name: site.name,
    type: 'Site',
    isActive: true,
    under: 'Project Accounts',
    referenceId: site._id,
    description: `Cost center for site ${site.name}`,
  });
  await costCenter.save();
  console.log(`[Site Ledger Sync] Created cost center for ${site.name}`);
}


};

module.exports = {
  createLedger,
  createGroup,
  getLedgers,
  getGroups,
  getLedgerById,
  getGroupById,
  updateLedger,
  updateGroup,
  deleteGroup,
  deleteLedger,
  addLedger,
  mapLedger,
  addLedgerAndCostCenterForSite,
};
