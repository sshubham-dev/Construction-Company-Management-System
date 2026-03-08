const ProjectSchedule = require("../models/projectschedule.models");
const Site = require("../models/site.models");
const mongoose = require("mongoose");
const {
  sendApproveByAdmin,
  sendApproveByIncharge,
  sendApproveByAccountHead,
} = require("./approval.controller.js");
const User = require("../models/user.models.js");
const {sendPushNotification, notifyRole} = require("../utils/pushNotification.js");

const getProjectSchedules = async (req, res) => {
  try {
    const projectschedules = await ProjectSchedule.find()
      .populate("site.id")
      // .where('adminApprove').equals('Approved')
      .where("approvalStatus")
      .equals("Approved")
      .sort({ createdAt: -1 })
      .exec();
    if (projectschedules.length === 0)
      return res.status(404).json({ error: "No Project Schedule Found" });
    return res.status(200).json(projectschedules);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDraftProjectSchedules = async (req, res) => {
  try {
    const user = req.user;
    const projectschedules = await ProjectSchedule.find()
      .where("approvalStatus")
      .equals("Pending")
      .where("createdBy")
      .equals(user?._id)
      .populate("site.id")
      .sort({ createdAt: -1 })
      .exec();
    if (projectschedules.length === 0)
      return res.status(404).json({ error: "No Project Schedule Found" });
    return res.status(200).json(projectschedules);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const _id = req.params.id;
    const projectschedule = await ProjectSchedule.findById(_id);
    if (!projectschedule && projectschedule?.projectDetail.length === 0)
      return res
        .status(404)
        .json({ error: "No Project Schedule & Details Found" });
    const projectDetail = projectschedule.projectDetail;
    return res.status(200).json(projectDetail);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProjectSchedule = async (req, res) => {
  try {
    const id = req.params.id;
    // Check if the ID is a valid ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Project Schedule ID" });
    }
    const projectschedule = await ProjectSchedule.findById(id)
      .populate("site.id")
      .exec();
    if (!projectschedule)
      return res.status(404).json({ error: "Project Schedule not found" });
    return res.status(200).json(projectschedule);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMonthlyProjectSchedule = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const allowedSites =
      req.user?.site?.map((s) => new mongoose.Types.ObjectId(s.id)) || [];

    const pipeline = [
      { $unwind: "$projectDetail" },

      // ✅ Get latest replanned date if exists
      {
        $addFields: {
          "projectDetail.latestReplanDate": {
            $let: {
              vars: {
                sorted: {
                  $sortArray: {
                    input: "$projectDetail.rePlannedDates",
                    sortBy: { date: -1 },
                  },
                },
              },
              in: { $arrayElemAt: ["$$sorted.date", 0] },
            },
          },
        },
      },

      // ✅ Filter by rule:
      // If latestReplanDate exists → check that date
      // Else → check planned date
      {
        $match: {
          $or: [
            {
              $and: [
                { "projectDetail.latestReplanDate": { $ne: null } },
                {
                  "projectDetail.latestReplanDate": {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                  },
                },
              ],
            },
            {
              $and: [
                { "projectDetail.latestReplanDate": { $eq: null } },
                {
                  "projectDetail.planned": {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                  },
                },
              ],
            },
          ],
        },
      },
    ];

    // ✅ Apply site restriction for non-admin users
    if (
      !["Ceo", "Admin", "Account Head", "Marketing"].includes(
        req.user.department
      )
    ) {
      pipeline.push({
        $match: { "site.id": { $in: allowedSites } },
      });
    }

    // ✅ Final projection
    pipeline.push({
      $project: {
        site: 1,
        scheduleId: 1,
        workDetail: "$projectDetail.workDetail",
        planned: "$projectDetail.planned",
        latestReplanDate: "$projectDetail.latestReplanDate",
        rePlannedDates: "$projectDetail.rePlannedDates",
        status: "$projectDetail.status",
        actual: "$projectDetail.actual",
        difference: "$projectDetail.difference",
        reason: "$projectDetail.reason",
      },
    });

    const projectSchedules = await ProjectSchedule.aggregate(pipeline);

    // console.log("Filtered Monthly Project Schedules:", projectSchedules.length);
    res.status(200).json(projectSchedules);
  } catch (error) {
    console.error("Error in getMonthlyProjectSchedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createProjectSchedule = async (req, res) => {
  try {
    const user = req.user;
    const { site, date, projectDetail } = req.body;

    const existingSite = await Site.findById(site);

    const existingProjectSchedule = await ProjectSchedule.findOne({
      site: { id: existingSite._id },
    });
    if (existingProjectSchedule)
      return res.status(500).json({ error: "Project Schedule Already exists" });

    const newProjectSchedule = new ProjectSchedule({
      site: { id: existingSite._id, name: existingSite.name },
      date,
      // scheduleId,
      projectDetail,
      createdBy: user._id,
    });

    const savedProjectSchedule = await newProjectSchedule.save();
    if (!savedProjectSchedule)
      return res.status(500).json({ error: "Something went wrong" });
    sendApproveByAdmin(savedProjectSchedule, "Project Schedule", user._id);
    // sendApproveByAccountHead(savedProjectSchedule, 'Project Schedule', user._id)
    // sendApproveByIncharge(savedProjectSchedule, "Project Schedule", user._id);
    const existingUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    const employees = await User.find({ role: "Employee" });

    for (const employee of employees) {
      sendPushNotification(
        employee._id,
        `Project Schedule for ${existingSite.name} has been created by ${existingUser.userName}.`
      );
      employee.notification.push({
        title: "Project Schedule Alert",
        message: `A Project Schedule created by ${existingUser.userName} for ${existingSite.name}`,
        createdAt: savedProjectSchedule.createdAt
          ? savedProjectSchedule.createdAt
          : new Date(),
        link: `/project-schedule/${savedProjectSchedule._id}`,
      });
      await employee.save();
    }
    return res.status(200).json({
      message: "Project Schedule created Successfully",
      savedProjectSchedule,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const saveProjectSchedule = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    // console.log(user)
    const projectSchedule = await ProjectSchedule.findById(id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    if (!projectSchedule)
      return res.status(404).json({ message: "No projectSchedule Found" });
    const existingSite = await Site.findById(projectSchedule?.site?.id);
    if (projectSchedule.createdBy.toString() === user?._id.toString()) {
      if (projectSchedule.adminApprove === "Approved") {
        projectSchedule.approvalStatus = "Approved";
        await projectSchedule.save();
        existingSite.projectSchedule = projectSchedule._id;
        await existingSite.save({ validateBeforeSave: false });
        console.log("projectSchedule:", projectSchedule);
        const employees = await User.find({ role: "Employee" });

        for (const employee of employees) {
          employee.notification.push({
            title: "Project Schedule Alert",
            message: `${existingSite.name} Project Schedule has been Approved`,
            createdAt: projectSchedule.createdAt
              ? projectSchedule.createdAt
              : new Date(),
            link: `/project-schedule/${projectSchedule._id}`,
          });
          await employee.save();
        }
        return res
          .status(201)
          .json({ message: "projectSchedule Saved Successfuly" });
      } else {
        console.log("projectSchedule is Not Approved By Every One");
        return res
          .status(400)
          .json({ message: "projectSchedule is Not Approved By Every One" });
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

const updateProjectSchedule = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const {
      site,
      date,
      projectDetail: [{ workDetail, planned, status }],
    } = req.body;
    console.table(req.body);
    console.table(id);

    const existingSite = await Site.findById(site);
    // Find the existing project schedule
    const existingProjectSchedule = await ProjectSchedule.findById(id);

    console.log(existingProjectSchedule);
    if (!existingProjectSchedule) {
      return res.status(404).json({ message: "Project Schedule not found" });
    }

    existingProjectSchedule.site =
      { id: existingSite._id, name: existingSite.name } ||
      existingProjectSchedule.site;
    existingProjectSchedule.date = date || existingProjectSchedule.date;
    // existingProjectSchedule.scheduleId =
    // scheduleId || existingProjectSchedule.scheduleId;
    const newProjectDetail = {
      _id: new mongoose.Types.ObjectId(),
      workDetail,
      planned,
      status,
    };
    if (newProjectDetail) {
      existingProjectSchedule.projectDetail.push(newProjectDetail);
    }

    const updatedProjectSchedule = await existingProjectSchedule.save();
    // sendApproveByAdmin(updatedProjectSchedule, "Update Schedule", user._id);
    return res.status(200).json({
      message: "Project Schedule updated successfully",
      updatedProjectSchedule,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteProjectSchedule = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const deletedProjectSchedule = await ProjectSchedule.findByIdAndDelete(id);
    if (!deletedProjectSchedule)
      return res.status(500).json({ error: "Something went wrong" });
    return res.status(200).json({
      message: "Project Schedule Deleted Successfully",
      deletedProjectSchedule,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateProjectDetail = async (req, res) => {
  try {
    const { id, index } = req.params;
    const { workDetail, rePlannedDates, actual, difference, reason, status } =
      req.body;
    console.log("first", rePlannedDates);
    const projectSchedule = await ProjectSchedule.findById(id);
    if (!projectSchedule)
      return res.status(404).json({ error: "No Project Schedule Found" });

    const workItem = projectSchedule.projectDetail[index];
    if (!workItem)
      return res.status(404).json({ error: "No Work Detail Found" });

    // ✅ Add a new replanned date if provided
    if (rePlannedDates && rePlannedDates.length > 0) {
      workItem.rePlannedDates = workItem.rePlannedDates || [];
      workItem.rePlannedDates.push(...rePlannedDates);
    }

    if (workDetail) workItem.workDetail = workDetail;
    if (actual) workItem.actual = actual;
    if (difference) workItem.difference = difference;
    if (reason) workItem.reason = reason;
    if (status) workItem.status = status;

    await projectSchedule.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Project detail updated successfully",
      updatedWork: workItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete ProjectDetail by Index
const deleteProjectDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const index = req.params.index;
    // console.log('id:', req.params.id);
    // console.log('index', req.params.index);
    // console.log("user.id:", user?._id)
    const projectSchedule = await ProjectSchedule.findById(id)
      .where("createdBy")
      .equals(user?._id)
      .exec();

    if (!projectSchedule) {
      return res.status(404).json({ error: "Project Schedule not found" });
    }
    // console.log(projectSchedule);

    projectSchedule.projectDetail.splice(index, 1);
    await projectSchedule.save();
    const projectSchedules = await ProjectSchedule.find();
    res.status(201).json(projectSchedule);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  getProjectSchedule,
  getProjectSchedules,
  getProjectDetails,
  createProjectSchedule,
  updateProjectSchedule,
  deleteProjectSchedule,
  updateProjectDetail,
  deleteProjectDetail,
  saveProjectSchedule,
  getDraftProjectSchedules,
  getMonthlyProjectSchedule,
};
