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
      openingBalance = 0,
      referenceType,
      referenceId,
      createCostCenter,
      businessUnitId,
    } = req.body;

    // 1. Create ledger
    const ledger = new Ledger({
      name,
      alias,
      under,
      businessUnitId,
      statutoryDetails,
      mailingDetails,
      taxRegistrationDetails,
      bankingDetails,

      openingBalance,
      currentBalance: openingBalance,

      referenceType,
      referenceId,

      isActive: true,
    });

    await ledger.save();

    // 2. Map ledger to reference entity (if provided)
    if (referenceType && referenceId) {
      const modelMap = {
        Client,
        Site,
        Contractor,
        Supplier,
        Employee,
      };

      const RefModel = modelMap[referenceType];
      if (!RefModel) {
        return res.status(400).json({ error: "Invalid referenceType" });
      }

      await RefModel.findByIdAndUpdate(referenceId, {
        ledger: ledger._id,
      });
    }

    // 3. Optional cost center creation
    if (createCostCenter) {
      const costCenter = new CostCenter({
        name,
        type: referenceType || "Ledger",
        under: "Primary",
        isActive: true,
        referenceId: referenceId || ledger._id,
        description: `Auto-created from ledger: ${name}`,
      });

      await costCenter.save();
    }

    return res.status(201).json(ledger);
  } catch (error) {
    console.error("Ledger creation error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const addLedger = async (data, under, gst, tds, referenceType) => {
  try {
    const ledger = new Ledger({
      name: data.name,
      alias: data.name,
      under,

      referenceType,
      referenceId: data._id,

      statutoryDetails: {
        isTDSDeductible: !!tds,
        isGSTApplicable: !!gst,
      },

      mailingDetails: {
        name: data.name,
        address: `${data.address?.street || ""}, ${data.address?.city || ""}, ${data.address?.district || ""}`,
        state: data.address?.state || "",
      },

      taxRegistrationDetails: {
        panNo: data.pan || "",
        gstNo: data.gstNo || "",
      },

      bankingDetails: {
        accountHolder: data.name,
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branch: "",
      },

      openingBalance: 0,
      currentBalance: 0,

      isActive: true,
    });

    await ledger.save();
    return ledger;
  } catch (error) {
    console.error("addLedger error:", error);
    throw error;
  }
};

const getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find()
    .sort({ name: 1 })
    .exec();
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
    const allowedFields = [
      "name",
      "alias",
      "under",
      "statutoryDetails",
      "mailingDetails",
      "bankingDetails",
      "taxRegistrationDetails",
      "isActive",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const ledger = await Ledger.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!ledger) {
      return res.status(404).json({ error: "Ledger not found" });
    }

    res.json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const mapLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const { referenceId, referenceType } = req.body;

    if (!referenceType || !referenceId) {
      return res.status(400).json({ error: "referenceType and referenceId are required" });
    }

    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ error: "Ledger not found" });
    }

    // Prevent remapping if already mapped
    if (ledger.referenceId && ledger.referenceType) {
      return res.status(400).json({
        error: "Ledger is already mapped. Unmap before remapping.",
      });
    }

    const modelMap = {
      Employee,
      Client,
      Site,
      Contractor,
      Supplier,
    };

    const RefModel = modelMap[referenceType];
    if (!RefModel) {
      return res.status(400).json({ error: "Invalid referenceType" });
    }

    await RefModel.findByIdAndUpdate(referenceId, {
      ledger: ledger._id,
    });

    ledger.referenceType = referenceType;
    ledger.referenceId = referenceId;
    await ledger.save();

    return res.status(200).json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const deleteLedger = async (req, res) => {
  try {
    await Ledger.findByIdAndUpdate(req.params.id, { isActive: false });
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
