const Housekeeping = require('../models/housekeeping.models');
const Site = require('../models/site.models');

const createHousekeeping = async (req, res) => {
  try {
    const { checkFor, siteId, locationName, tasks } = req.body;

    if (!checkFor || !tasks?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const points = Number(((completed / total) * 10).toFixed(2));

    const payload = {
      checkFor,
      tasks,
      points,
      createdBy: req.user._id,
    };

    if (checkFor === "Site") {
      const site = await Site.findById(siteId);
      if (!site) return res.status(404).json({ message: "Site not found" });
      payload.site = { id: site._id, name: site.name };
    } else {
      payload.locationName = locationName; // Office/Store name only
    }

    const checklist = await Housekeeping.create(payload);
    res.status(201).json(checklist);
  } catch (error) {
    console.log("Housekeeping error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getHousekeeping = async (req, res) => {
  try {
    const { checkFor, siteId, locationName, from, to } = req.query;

    const filter = {};

    if (checkFor) filter.checkFor = checkFor;
    if (siteId) filter["site.id"] = siteId;
    if (locationName) filter.locationName = locationName;

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const records = await HousekeepingChecklist.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.status(200).json(records);
  } catch (error) {
    console.log("Get housekeeping error:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateHousekeeping = async (req, res) => {
  try {
    const { id } = req.params;
    const { tasks, locationName, siteId } = req.body;

    const checklist = await Housekeeping.findById(id);
    if (!checklist) return res.status(404).json({ message: "Record not found" });

    if (tasks) {
      const total = tasks.length;
      const completed = tasks.filter((t) => t.completed).length;
      checklist.points = Number(((completed / total) * 10).toFixed(2));
      checklist.tasks = tasks;
    }

    if (checklist.checkFor === "Site" && siteId) {
      const site = await Site.findById(siteId);
      if (!site) return res.status(404).json({ message: "Site not found" });
      checklist.site = { id: site._id, name: site.name };
    }

    if (checklist.checkFor !== "Site" && locationName) {
      checklist.locationName = locationName;
    }

    await checklist.save();
    res.status(200).json(checklist);
  } catch (error) {
    console.log("Update housekeeping error:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteHousekeeping = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Housekeeping.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.log("Delete housekeeping error:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createHousekeeping,
  updateHousekeeping,
  deleteHousekeeping,
  getHousekeeping
};