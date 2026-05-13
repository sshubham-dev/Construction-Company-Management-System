const Site = require("../models/site.models");
const Client = require("../models/client.models");
const User = require("../models/user.models");
const Contractor = require("../models/contractor.models");
const { WorkOrder } = require("../models/workorder.models");
const Bill = require("../models/bill.models.js");
const PaymentSchedule = require("../models/paymentschedule.models");
const ProjectSchedule = require("../models/projectschedule.models");
const PurchaseOrder = require("../models/purchaseOrder.models.js");
const ExtraWork = require("../models/extrawork.models.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const {
  sendPushNotification,
  notifyRole,
} = require("../utils/pushNotification.js");
const SyncStore_CostCenter = require("../utils/costcenter_storeSync.js");

const getSites = async (req, res) => {
  try {
    const sites = await Site.find()
      .populate("bill")
      .populate("purchaseOrder")
      .populate("projectSchedule")
      .populate("paymentSchedule")
      .populate("workOrder")
      .sort({ name: 1 })
      .exec();
    if (sites.length === 0)
      return res.status(404).json({ error: "Sites Not Found" });
    res.status(200).json(sites);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSite = async (req, res) => {
  try {
    const id = req.params.id;
    if (id === undefined)
      return res.status(500).json({ error: "Id undefined" });
    const site = await Site.findById(id)
      .populate("bill")
      .populate("purchaseOrder")
      .populate("projectSchedule")
      .populate("paymentSchedule")
      .populate("workOrder")
      .exec();
    if (!site) return res.status(500).json({ error: "No Site Exists" });
    res.status(200).json(site);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const siteByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // console.log('id', id)
    const user = await User.findById(userId);
    if (user && user.department === "Site Incharge") {
      const inchargeSite = await Site.find()
        .where("incharge.id")
        .equals(user?._id)
        .exec();

      if (inchargeSite.length === 0)
        return res.status(500).json({ error: "Sites Not Found" });
      return res.status(201).json(inchargeSite);
    } else if (user.department === "Site Supervisor") {
      const supervisorSite = await Site.find()
        .where("supervisor.id")
        .equals(user?._id)
        .exec();
      if (supervisorSite.length === 0)
        return res.status(500).json({ error: "Sites Not Found" });
      return res.status(201).json(supervisorSite);
    } else if (user.department === "Client") {
      const existingClient = await Client.findOne({ userId: user?._id });
      const clientSite = await Site.find({ _id: existingClient?.site.id });
      if (clientSite.length === 0)
        return res.status(500).json({ error: "Sites Not Found" });
      return res.status(201).json(clientSite);
    } else {
      return res.status(500).json({ error: "No Site Registered For You" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createSite = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const {
      name,
      client,
      siteId,
      floors,
      structureType,
      incharge,
      qualityEngineer,
      supervisor,
      projectType,
      address,
    } = req.body;

    const agreementLocalPath = req.file?.path;
    const existingSite = await Site.findOne({
      $and: [{ name }, { "client.id": client }],
    });

    if (existingSite)
      return res.status(400).json({ message: "Site already exists" });

    const upload = agreementLocalPath
      ? await uploadOnCloudinary(agreementLocalPath, {
        folder: "sites/agreements",
        public_id: `${name}-${Date.now()}`,
      })
      : null;

    const existingClient = client ? await Client.findById(client) : null;
    const existingIncharge = incharge ? await User.findById(incharge) : null;
    const existingSupervisor = supervisor
      ? await User.findById(supervisor)
      : null;
    const existingQuality = qualityEngineer
      ? await User.findById(qualityEngineer)
      : null;

    // ✅ Sanitize floors data
    let parsedFloors = [];
    if (floors) {
      if (typeof floors === "string") {
        // if sent as JSON string
        parsedFloors = JSON.parse(floors);
      } else if (Array.isArray(floors)) {
        parsedFloors = floors;
      }
    }

    const newSite = new Site({
      name,
      client: existingClient
        ? { id: existingClient._id, name: existingClient.name }
        : null,
      siteId,
      businessUnitId: user.businessUnitId,
      companyId: user.companyId,
      structureType,
      floors: parsedFloors,
      incharge: existingIncharge
        ? { id: existingIncharge._id, name: existingIncharge.userName }
        : null,
      supervisor: existingSupervisor
        ? { id: existingSupervisor._id, name: existingSupervisor.userName }
        : null,
      qualityEngineer: existingQuality
        ? { id: existingQuality._id, name: existingQuality.userName }
        : null,
      projectType,
      address,
      agreement: {
        secure_url: upload?.secure_url || null,
        public_id: upload?.public_id || null,
      },
    });

    const savedSite = await newSite.save();
    await assignSiteToUsers(savedSite, existingIncharge, existingSupervisor);

    const storeData = {
      businessUnitId: savedSite.businessUnitId,
      address: { line1: savedSite?.address },
      storeHead: savedSite.incharge?.id,
      storeIncharge: existingSupervisor
        ? savedSite.supervisor?.id : null,
      companyId: savedSite.companyId,
      type: "SITE",
      name: savedSite.name,
    }

    const store_costCenter = await SyncStore_CostCenter(storeData)
    savedSite.costcenter = store_costCenter?.costCenterId;
    savedSite.store = store_costCenter?._id;
    await savedSite.save();

    const employees = await User.find({ role: "Employee" });

    for (const employee of employees) {
      sendPushNotification(
        employee._id,
        `Congratulations Team 🎉 we have a new project Confirmed in ${savedSite.address}.`,
      );
      sendPushNotification(
        employee._id,
        `${savedSite.name} have been assigned to you ${savedSite.incharge.name}.`,
      );
    }
    res.status(201).json({
      message: "Site created successfully",
      savedSite,
    });
  } catch (error) {
    console.error("Error creating site:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateSite = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      client,
      siteId,
      floors,
      structureType,
      incharge,
      supervisor,
      qualityEngineer,
      projectType,
      address,
    } = req.body;
    const user = req.user;

    const agreementLocalPath = req.file?.path;
    const upload = agreementLocalPath
      ? await uploadOnCloudinary(agreementLocalPath, {
        folder: "sites/agreements",
        public_id: `${name}-${Date.now()}`,
      })
      : null;

    const existingClient = client ? await Client.findById(client) : null;
    const existingIncharge = incharge ? await User.findById(incharge) : null;
    const existingSupervisor = supervisor
      ? await User.findById(supervisor)
      : null;
    const existingQuality = qualityEngineer
      ? await User.findById(qualityEngineer)
      : null;

    const existingSite = await Site.findById(id);
    if (!existingSite) return res.status(404).json({ error: "Site not found" });

    // ✅ Parse floors if provided
    let parsedFloors = existingSite.floors || [];
    if (floors) {
      parsedFloors = typeof floors === "string" ? JSON.parse(floors) : floors;
    }

    // ✅ Update fields safely
    existingSite.name = name || existingSite.name;
    existingSite.siteId = siteId || existingSite.siteId || "";
    existingSite.structureType = structureType || existingSite.structureType;
    existingSite.address = address || existingSite.address;
    existingSite.floors = parsedFloors;
    existingSite.projectType = projectType || existingSite.projectType;
    existingSite.companyId = existingSite.companyId || req.user.companyId;
    existingSite.businessUnitId = user.businessUnitId || esistingSite?.businessUnitId

    if (existingClient) {
      existingSite.client = {
        id: existingClient._id,
        name: existingClient.name,
      };
      existingClient.site = {
        id: existingSite._id,
        name: existingSite.name,
      };
      await existingClient.save();
    }

    if (existingIncharge) {
      existingSite.incharge = {
        id: existingIncharge._id,
        name: existingIncharge.userName,
      };
      // existingIncharge.site = {
      //   id: existingSite._id,
      //   name: existingSite.name,
      // };
      await existingIncharge.save();
    }

    if (existingSupervisor) {
      existingSite.supervisor = {
        id: existingSupervisor._id,
        name: existingSupervisor.userName,
      };
      // existingSupervisor.site = {
      //   id: existingSite._id,
      //   name: existingSite.name,
      // };
      await existingSupervisor.save();
    }

    if (existingQuality) {
      existingSite.qualityEngineer = {
        id: existingQuality._id,
        name: existingQuality.userName,
      };
      // existingQuality.site = {
      //   id: existingSite._id,
      //   name: existingSite.name,
      // };
      await existingQuality.save();
    }

    if (upload?.secure_url)
      existingSite.agreement = {
        secure_url: upload.secure_url,
        public_id: upload.public_id,
      };

    const storeData = {
      businessUnitId: existingSite.businessUnitId,
      address: { line1: existingSite?.address },
      storeHead: existingSite.incharge?.id,
      storeIncharge: existingSite.supervisor?.id,
      companyId: existingSite.companyId,
      type: "SITE",
      name: existingSite.name,
    }
    const siteStore = existingSite.store;

    const store_costCenter = await SyncStore_CostCenter(storeData)
    existingSite.costcenter = store_costCenter?.costCenterId;
    existingSite.store = store_costCenter?._id;

    console.log("store_costCenter", store_costCenter)
    const updated = await existingSite.save();
    await assignSiteToUsers(updated, existingIncharge, existingSupervisor);

    res.status(200).json({
      message: "Site updated successfully",
      // updated,
    });
  } catch (error) {
    console.error("Error updating site:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteSite = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedSite = await Site.findByIdAndDelete(id);
    if (!deletedSite) return res.status(404).json({ error: "Site not Found" });
    console.log("deletedSite:", deletedSite);

    const existingClient = await Client.findById(deletedSite.client.id);
    const existingIncharge = await User.findById(deletedSite.incharge.id);
    let existingSupervisor;
    if (deletedSite.supervisor !== "") {
      existingSupervisor = await User.findById(deletedSite.supervisor.id);
    }
    let existingQuality;
    if (deletedSite.qualityEngineer !== "") {
      existingQuality = await User.findById(deletedSite.qualityEngineer.id);
    }
    const existingContractors = await Contractor.find();
    const existingWorkOrders = await WorkOrder.find()
      .where("site.id")
      .equals(deleteSite._id)
      .exec();
    const existingBills = await Bill.find()
      .where("site.id")
      .equals(deleteSite._id)
      .exec();
    const existingPurchaseOrder = await PurchaseOrder.find()
      .where("site.id")
      .equals(deleteSite._id)
      .exec();
    const existingPaymentSchedule = await PaymentSchedule.findOneAndDelete()
      .where("site.id")
      .equals(deleteSite._id)
      .exec();
    const existingExtraWork = await ExtraWork.find()
      .where("site.id")
      .equals(deleteSite._id)
      .exec();
    const existingProjectSchedule = await ProjectSchedule.findOneAndDelete()
      .where("site.id")
      .equals(deleteSite._id)
      .exec();

    // console.log('existingWorkOrders:', existingWorkOrders);

    for (const workOrder of existingWorkOrders) {
      if (workOrder) {
        workOrder.site = null;
        await workOrder.save();
        console.log(workOrder.site);
      }
    }

    for (const bill of existingBills) {
      if (bill) {
        bill.site = null;
        await bill.save();
      }
      console.log(bill.site);
    }
    for (const purchaseOrder of existingPurchaseOrder) {
      if (purchaseOrder) {
        purchaseOrder.site = null;
        await purchaseOrder.save();
      }
      console.log(purchaseOrder.site);
    }

    for (const extraWork of existingExtraWork) {
      if (extraWork) {
        extraWork.site = null;
        await extraWork.save();
      }
      console.log(extraWork.site);
    }

    // console.log('existingContractor:', existingContractors);
    for (const contractor of existingContractors) {
      contractor.site = contractor.site.filter(
        (s) => s.id?.toString() !== deletedSite._id.toString(),
      );
      await contractor.save();
    }

    if (existingClient) {
      existingClient.site = null;
      await existingClient.save({ validateBeforeSave: false });
    }

    if (deletedSite.supervisor && existingSupervisor) {
      const index = existingSupervisor.site?.findIndex(
        (id) => id.toString() === deletedSite._id.toString(),
      );
      if (index !== -1) {
        existingSupervisor.site.splice(index, 1);
        await existingSupervisor.save();
      }
    }

    if (existingIncharge) {
      const index = existingIncharge.site?.findIndex(
        (id) => id.toString() === deletedSite._id.toString(),
      );
      if (index !== -1) {
        existingIncharge.site.splice(index, 1);
        await existingIncharge.save();
      }
    }

    if (deletedSite.qualityEngineer && existingQuality) {
      const index = existingQuality.site?.findIndex(
        (id) => id.toString() === deletedSite._id.toString(),
      );
      if (index !== -1) {
        existingQuality.site.splice(index, 1);
        await existingQuality.save();
      }
    }

    // find the collections related with site & delete this site from them to - todo
    return res.status(200).json({ message: "Site Deleted Successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const assignSiteToUsers = async (site, incharge, supervisor) => {
  try {
    const assignToUser = async (userRef) => {
      if (!userRef) return;

      // Handle both user doc or plain ID
      const userId = userRef._id ? userRef._id : userRef;
      const user = await User.findById(userId);

      if (!user) return;

      // Check if this site is already assigned
      const alreadyAssigned = user.site?.some(
        (s) => String(s.id) === String(site._id),
      );

      if (!alreadyAssigned) {
        await User.findByIdAndUpdate(userId, {
          $push: { site: { id: site._id, name: site.name } },
        });
        console.log(`✅ Assigned site '${site.name}' to ${user.userName}`);
      } else {
        console.log(
          `⚠️ Site '${site.name}' already assigned to ${user.userName}`,
        );
      }
    };

    await assignToUser(incharge);
    await assignToUser(supervisor);
  } catch (error) {
    console.error("❌ Error assigning site:", error);
  }
};

module.exports = {
  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
  siteByUser,
};
