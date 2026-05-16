const QualitySchedule = require("../models/qualityschedule.models");
const {
  sendApproveByAdmin,
  sendApproveByIncharge,
  sendApproveByQuality,
} = require("./approval.controller.js");
const Site = require("../models/site.models");
const User = require("../models/user.models");
const mongoose = require("mongoose");
const {sendPushNotification, notifyRole} = require("../utils/pushNotification.js");
const Employee = require("../models/employee.models");

const getQualitySchedules = async (req, res) => {
  try {
    const qualityschedules = await QualitySchedule.find()
      .populate("site.id")
      .sort({ createdAt: -1 })
      .exec();
    if (qualityschedules.length === 0)
      return res.status(404).json({ error: "No Quality Schedule Found" });
    return res.status(200).json(qualityschedules);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getWorkDetails = async (req, res) => {
  try {
    const _id = req.params.id;
    const qualityschedule = await QualitySchedule.findById(_id);
    if (!qualityschedule && qualityschedule?.workDetails.length === 0)
      return res
        .status(404)
        .json({ error: "No Quality Schedule & Work Details Found" });
    const workDetail = qualityschedule.workDetails;
    return res.status(200).json(workDetail);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getQualitySchedule = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const qualityschedule = await QualitySchedule.findById(id);
    if (!qualityschedule)
      return res.status(404).json({ error: "Quality Schedule not found" });
    return res.status(200).json(qualityschedule);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getQualitySchedulesBySite = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const qualityschedule = await QualitySchedule.find()
      .where("site.id")
      .equals(id)
      .exec();
    if (qualityschedule.length === 0)
      return res.status(404).json({ error: "Quality Schedule not found" });
    const qualityschedules = qualityschedule.map((q) => q.workDetails);
    return res.status(200).json(qualityschedules);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMonthlyQualitySchedule = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const allowedSites =
      req.user?.site?.map((s) => new mongoose.Types.ObjectId(s.id)) || [];

    const matchFilter = {
      "workDetails.checkingDate": {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    };

    // If not CEO/admin, restrict sites
    if (
      !["Ceo", "Admin", "Account Head", "Marketing"].includes(
        req.user.department
      )
    ) {
      matchFilter["site.id"] = { $in: allowedSites };
    }

    const qualitySchedules = await QualitySchedule.aggregate([
      { $unwind: "$workDetails" },
      { $match: matchFilter },
      {
        $project: {
          work: "$workDetails.work",
          checkingDate: "$workDetails.checkingDate",
          status: "$workDetails.status",
          checkedAt: "$workDetails.checkedAt",
          difference: "$workDetails.difference",
          reason: "$workDetails.reason",
          site: 1,
          qualityScheduleId: 1,
        },
      },
    ]);
    // console.log("qualitySchedules:", qualitySchedules);
    res.status(200).json(qualitySchedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createQualitySchedule = async (req, res) => {
  try {
    const user = req.user;
    const { site, workDetails } = req.body;
    // console.log(req.body)
    const existingSite = await Site.findById(site);

    const existingQualitySchedule = await QualitySchedule.findOne({
      site: { id: existingSite._id },
    });
    if (existingQualitySchedule)
      return res.status(500).json({ error: "Quality Schedule Already exists" });

    const newQualitySchedule = new QualitySchedule({
      site: { id: existingSite?._id, name: existingSite?.name },
      workDetails,
      createdBy: user._id,
    });
    
    console.log(newQualitySchedule);

    const savedQualitySchedule = await newQualitySchedule.save();

    if (!savedQualitySchedule)
      return res.status(500).json({ error: "Something went wrong" });

    sendApproveByIncharge(savedQualitySchedule, "Quality Schedule", user._id);
    sendApproveByQuality(savedQualitySchedule, "Quality Schedule", user._id);
    const existingUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    const employees = await User.find({ role: "Employee" });

    for (const employee of employees) {
              sendPushNotification(
          employee._id,
          `${user.userName} has created Quality Schedule for ${existingSite.name}`
        );
      employee.notification.push({
        title: "Quality Schedule Alert",
        message: `A Quality Schedule created by ${existingUser.userName} for ${existingSite.name}`,
        createdAt: savedQualitySchedule.createdAt
          ? savedQualitySchedule.createdAt
          : new Date(),
        link: `/quality-schedule/${savedQualitySchedule._id}`,
      });
      await employee.save();
    }

    return res.status(200).json({
      message: "Quality Check Schedule created Successfully",
      savedQualitySchedule,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const saveQualitySchedule = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    // console.log(user)
    const qualitySchedule = await QualitySchedule.findById(id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    if (!qualitySchedule)
      return res.status(404).json({ message: "No qualitySchedule Found" });
    const existingSite = await Site.findById(qualitySchedule?.site?.id);
    if (qualitySchedule.createdBy.toString() === user?._id.toString()) {
      if (
        qualitySchedule.qualityApprove === "Approved" &&
        qualitySchedule.inchargeApprove === "Approved"
      ) {
        qualitySchedule.approvalStatus = "Approved";
        await qualitySchedule.save();
        existingSite.qualitySchedule.push(qualitySchedule._id);
        await existingSite.save({ validateBeforeSave: false });
        console.log("qualitySchedule:", qualitySchedule);
        const employees = await User.find({ role: "Employee" });

        for (const employee of employees) {
          employee.notification.push({
            title: "Quality Schedule Alert",
            message: `Quality Schedule for ${existingSite.name} has been approved`,
            createdAt: qualitySchedule.createdAt
              ? qualitySchedule.createdAt
              : new Date(),
            link: `/quality-schedule/${qualitySchedule._id}`,
          });
          await employee.save();
        }
        return res
          .status(201)
          .json({ message: "qualitySchedule Saved Successfuly" });
      } else {
        console.log("qualitySchedule is Not Approved By Every One");
        return res
          .status(400)
          .json({ message: "qualitySchedule is Not Approved By Every One" });
      }
    } else {
      console.log("Unauthorized Request");
      return res.status(401).json({ message: "Unauthorized Request" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const updateQualitySchedule = async (req, res) => {
  try {
    const id = req.params.id;
    const { site, workDetails } = req.body;
    console.log("req.body", req.body);
    console.table(id);

    const existingSite = await Site.findById(site);
    // Find the existing project schedule
    const existingQualitySchedule = await QualitySchedule.findById(id);
    console.log(existingQualitySchedule);
    if (!existingQualitySchedule) {
      return res.status(404).json({ error: "Quality Schedule not found" });
    }

    existingQualitySchedule.site =
      { id: existingSite._id, name: existingSite.name } ||
      existingQualitySchedule.site;
    // existingQualitySchedule.qualityScheduleId =
    // qualityScheduleId || existingQualitySchedule.qualityScheduleId;
    if (workDetails[0]?.work !== "" && workDetails[0]?.checkingDate !== "") {
      const newWorkDetail = {
        work: workDetails[0]?.work,
        checkingDate: workDetails[0]?.checkingDate,
      };
      if (newWorkDetail) {
        existingQualitySchedule.workDetails.push(newWorkDetail);
      }
    }

    const updatedQualitySchedule = await existingQualitySchedule.save();
    sendPushNotification(
      updatedQualitySchedule.createdBy,
      `Quality Schedule for ${updatedQualitySchedule.site.name} has been deleted`
    );
    return res.status(200).json({
      message: "Quality Schedule updated successfully",
      updatedQualitySchedule,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteQualitySchedule = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = req.user;
    const deletedProjectSchedule = await QualitySchedule.findByIdAndDelete(_id);
    if (!deletedProjectSchedule)
      return res.status(500).json({ error: "Something went wrong" });
    sendPushNotification(
      user._id,
      `Quality Schedule for ${deletedProjectSchedule.site.name} has been deleted`
    );
    // console.log("deletedProjectSchedule:", deletedProjectSchedule);
    return res
      .status(200)
      .json({ message: "Project Schedule Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateWorkDetail = async (req, res) => {
  try {
    const { id, index } = req.params;
    const { work, checkingDate, checkedAt, difference, reason, status } =
      req.body;

    console.log("id:", id);
    console.log("index:", index);

    // ✅ Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing QualitySchedule ID" });
    }

    const qualitySchedule = await QualitySchedule.findById(id);
    if (!qualitySchedule) {
      return res.status(404).json({ error: "No Project Schedule Found" });
    }

    qualitySchedule.workDetails[index] = {
      work,
      checkingDate,
      checkedAt,
      difference,
      reason,
      status,
    };

    await qualitySchedule.save({ validateBeforeSave: false });

    res
      .status(200)
      .json({ message: "Quality Work Detail Updated Successfully" });
  } catch (error) {
    console.log("Update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete ProjectDetail by Index
const deleteWorkDetail = async (req, res) => {
  try {
    const _id = req.params.id;
    const index = req.params.index;
    const qualitySchedule = await QualitySchedule.findById(_id);

    if (!qualitySchedule) {
      return res.status(404).json({ error: "Quality Schedule not found" });
    }

    qualitySchedule.workDetails.splice(index, 1);
    await qualitySchedule.save();
    const qualitySchedules = await QualitySchedule.find();
    res.status(201).json({
      message: "Work Detail Deleted Successfully",
      qualitySchedules,
      qualitySchedule,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  getQualitySchedule,
  getQualitySchedules,
  createQualitySchedule,
  updateQualitySchedule,
  deleteQualitySchedule,
  updateWorkDetail,
  deleteWorkDetail,
  getWorkDetails,
  saveQualitySchedule,
  getQualitySchedulesBySite,
  getMonthlyQualitySchedule,
};
