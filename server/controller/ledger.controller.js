// controllers/ledger.controller.js
const {
  createLedger,
  getLedgers,
  getLedgerById,
  updateLedger,
  deleteLedger,
  getLedgerReport,
} = require("../services/ERP/ledger.service");
const GroupService = require("../services/ERP/group.service");
const CostCenterService = require("../services/ERP/costcenter.service");

const create = async (req, res) => {
  try {
    const ledger = await createLedger(req.body);

    await mapLedger(ledger, req.body.referenceType, req.body.referenceId);

    res.status(201).json(ledger);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const { companyId } = req.query;

    const data = await getLedgers(companyId)


    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  const data = await getLedgerById(req.params.id)

  res.json(data);
};

const update = async (req, res) => {
  const data = await updateLedger(req.params.id, req.body);
  res.json(data);
};

const remove = async (req, res) => {
  await deleteLedger(req.params.id);
  res.json({ message: "Ledger deleted" });
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

const mapLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const { referenceId, referenceType } = req.body;

    if (!referenceType || !referenceId) {
      return res
        .status(400)
        .json({ error: "referenceType and referenceId are required" });
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
    console.error("mapLedger error:", error);
  }
};

// CRUD for Group
const createGroup = async (req, res) => {
  try {
    const data = await GroupService.createGroup(req.body, req.user);
    res.status(201).json(data);
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const data = await GroupService.getGroups(req.query.companyId);
    res.json(data);
  } catch (error) {
    console.error("Get Groups Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const updateGroup = async (req, res) => {
  const data = await GroupService.updateGroup(req.params.id, req.body);
  res.json(data);
};

// CRUD for Cost Center
const createCostCenter = async (req, res) => {
  try {
    const costCenter = await CostCenterService.createCostCenter(req.body);
    res.status(200).json(costCenter);
  } catch (error) {
    console.log(error);
  }
};

const getCostCenters = async (req, res) => {
  try {
    const costCenter = await CostCenterService.getCostCenters(
      req.query.companyId,
    );

    if (costCenter.length === 0) {
      return res.status(404).json({ message: "Cost Center Not Found" });
    }

    return res.status(200).json(costCenter);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

const updateCostCenter = async (req, res) => {
  try {
    const costCenter = await CostCenterService.updateCostCenter(
      req.params.id,
      req.body,
    );
    res.status(200).json(costCenter);
  } catch (error) {
    console.log(error);
  }
};

const deleteCostCenter = async (req, res) => {
  try {
    const costCenter = await CostCenterService.deleteCostCenter(req.params.id);
    res.status(200).json(costCenter);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,

  createGroup,
  getGroups,
  updateGroup,
  // getGroupById,
  // deleteGroup,

  addLedger,
  mapLedger,

  createCostCenter,
  getCostCenters,
  updateCostCenter,
  deleteCostCenter,
};
