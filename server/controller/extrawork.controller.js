const ExtraWork = require("../models/extrawork.models.js");
const Site = require("../models/site.models");
const Contractor = require("../models/contractor.models");
const Client = require("../models/client.models");
const {
  sendApproveByAdmin,
  sendApproveByIncharge,
  sendApproveByContractor,
  sendApproveByAccountHead,
} = require("./approval.controller.js");
const User = require("../models/user.models");
const { sendNotification } = require("./notification.controller.js");

const getExtraWorks = async (req, res) => {
  try {
    const extraWork = await ExtraWork.find()
      .populate("site.id")
      .populate("contractor.id")
      .sort({ createdAt: -1 })
      .exec();
    if (extraWork.length === 0)
      return res.status(401).json({ message: "No Extra Work Found" });
    res.status(201).json(extraWork);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExtraWork = async (req, res) => {
  try {
    const id = req.params.id;
    const extraWork = await ExtraWork.findById(id)
      .populate("site.id")
      .populate("contractor.id")
      .exec();
    if (!extraWork)
      return res.status(401).json({ message: "No Extra Work Found" });
    res.status(201).json(extraWork);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const siteExtraWork = async (req, res) => {
  try {
    const id = req.params.id;
    const extraWork = await ExtraWork.find()
      .where("site.id")
      .equals(id)
      .populate("site.id")
      .populate("contractor.id")
      .exec();

    if (!extraWork)
      return res.status(401).json({ message: "No Extra Work Found" });
    res.status(201).json(extraWork);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExtraBySiteAndContractor = async (req, res) => {
  try {
    const { site, contractor } = req.params;
    const extraWork = await ExtraWork.find()
      .where("site.id")
      .equals(site)
      .where("contractor.id")
      .equals(contractor)
      .populate("site.id")
      .populate("contractor.id")
      .exec();

    if (!extraWork)
      return res.status(401).json({ message: "No Extra Work Found" });
    res.status(201).json(extraWork);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createExtraWork = async (req, res, next) => {
  try {
    const user = req.user;
    const { contractor, site, extraFor, WorkDetail } = req.body;

    const existingSite = await Site.findById(site);
    if (site && WorkDetail && contractor === "") {
      console.log("site:", existingSite);
      const existingClient = await Client.findById(existingSite.client.id);
      const newExtraWork = new ExtraWork({
        site: {
          name: existingSite.name,
          id: existingSite._id,
        },
        client: {
          id: existingClient._id,
          name: existingClient.name,
        },
        extraFor,
        WorkDetail,
        createdBy: user._id,
      });
      const clientExtraWork = await newExtraWork.save();
      if (!clientExtraWork)
        return res.status(401).json({ message: "Extra Work not created" });

      sendApproveByAdmin(clientExtraWork, "Extra Work", user._id);
      sendApproveByAccountHead(clientExtraWork, "Extra Work", user._id);
      const existingUser = await User.findById(user._id).select(
        "-password -refreshToken"
      );
      const employees = await User.find({ role: "Employee" });

      for (const employee of employees) {
        employee.notification.push({
          title: "Extra Work Alert",
          message: `Extra Work raised by ${existingUser.userName} for ${clientExtraWork.extraFor} on ${existingSite.name}`,
          createdAt: clientExtraWork.createdAt
            ? clientExtraWork.createdAt
            : new Date(),
          link: `/extra-work/${clientExtraWork._id}`,
        });
        await employee.save();
        sendNotification(
          employee._id,
          `${user.userName} has created extra work for ${existingSite.name}`
        );
      }
      // existingClient.notification.push({
      //     title: 'Extra Work Alert',
      //     message: `Extra Work raised by ${existingUser.userName} for ${existingSite.name}`,
      //     createdAt: clientExtraWork.createdAt ? clientExtraWork.createdAt : new Date(),
      //     link: `/extra-work/${clientExtraWork._id}`,
      // })
      // await existingClient.save()
      res
        .status(201)
        .json({ message: "Extra Work Created Successfuly", clientExtraWork });
      next();
    } else if (contractor && WorkDetail) {
      const existingContractor = await Contractor.findOne({ _id: contractor });
      const newExtraWork = new ExtraWork({
        site: {
          name: existingSite.name,
          id: existingSite._id,
        },
        contractor: {
          id: existingContractor._id,
          name: existingContractor.name,
        },
        extraFor,
        WorkDetail,
        createdBy: user._id,
      });
      const contractorExtraWork = await newExtraWork.save();
      if (!contractorExtraWork)
        return res.status(401).json({ message: "Extra Work not created" });
      console.log(contractorExtraWork);

      sendApproveByAdmin(contractorExtraWork, "Extra Work", user._id);
      sendApproveByAccountHead(contractorExtraWork, "Extra Work", user._id);
      const existingUser = await User.findById(user._id).select(
        "-password -refreshToken"
      );
      const employees = await User.find({ role: "Employee" });

      for (const employee of employees) {
        employee.notification.push({
          title: "Extra Work Alert",
          message: `Extra Work raised by ${existingUser.userName} for ${contractorExtraWork.extraFor} on ${existingSite.name}`,
          createdAt: contractorExtraWork.createdAt
            ? contractorExtraWork.createdAt
            : new Date(),
          link: `/extra-work/${contractorExtraWork._id}`,
        });
        await employee.save();
        sendNotification(
          employee.userId,
          `${user.userName} has created extra work for ${existingSite.name}`
        );
      }
      // contractorExtraWork.notification.push({
      //     title: 'Extra Work Alert',
      //     message: `Extra Work raised by ${existingUser.userName} for ${existingSite.name}`,
      //     createdAt: contractorExtraWork.createdAt ? contractorExtraWork.createdAt : new Date(),
      //     link: `/extra-work/${contractorExtraWork._id}`,
      // })
      res.status(201).json({
        message: "Extra Work Created Successfuly",
        contractorExtraWork,
      });
    } else
      return res.status(401).json({ message: "All fields are mandantory" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const saveExtraWork = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    // console.log(user)
    const extraWork = await ExtraWork.findById(id);
    if (!extraWork)
      return res.status(404).json({ message: "No extraWork Found" });
    const existingSite = await Site.findById(extraWork?.site?.id);

    if (extraWork.createdBy.toString() === user?._id.toString()) {
      if (
        extraWork.adminApprove === "Approved" &&
        extraWork.accountheadApprove === "Approved"
      ) {
        extraWork.approvalStatus = "Approved";
        await extraWork.save();
        existingSite.extraWork.push(extraWork._id);
        await existingSite.save({ validateBeforeSave: false });

        if (extraWork.extraFor == "Client") {
          const existingClient = await Client.findById(extraWork.client?.id);
          existingClient.extraWork.push(extraWork._id);
          await existingClient.save({ validateBeforeSave: false });
        } else {
          const existingContractor = await Contractor.findById(
            extraWork?.contractor?.id
          );
          existingContractor.extraWork.push(extraWork._id);
          await existingContractor.save({ validateBeforeSave: false });
        }

        console.log("extraWork:", extraWork);
        return res.status(201).json({ message: "extraWork Saved Successfuly" });
      } else {
        console.log("extraWork is Not Approved By Every One");
        return res
          .status(400)
          .json({ message: "extraWork is Not Approved By Every One" });
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

const updateExtraWork = async (req, res) => {
  try {
    const id = req.params.id;
    const { contractor, client, site, extraFor, WorkDetail } = req.body;

    const existingExtraWork = await ExtraWork.findById(id);
    if (!existingExtraWork) {
      return res.status(404).json({ message: "No Extra Work Found" });
    }

    // ✅ Lock after full approval
    if (existingExtraWork.approvalStatus === "Approved") {
      return res.status(403).json({
        message: "Approved Extra Work cannot be modified",
      });
    }

    /* ================================
       ✅ SAFE SITE UPDATE (ID OR OBJECT)
    ================================= */
    if (site) {
      const siteId = typeof site === "object" ? site.id : site;
      const existingSite = await Site.findById(siteId);

      if (!existingSite) {
        return res.status(400).json({ message: "Invalid Site ID" });
      }

      existingExtraWork.site = {
        name: existingSite.name,
        id: existingSite._id,
      };
    }

    /* ================================
       ✅ SAFE EXTRA FOR + PARTY UPDATE
    ================================= */
    if (extraFor) {
      existingExtraWork.extraFor = extraFor;

      // ✅ CONTRACTOR (ID OR OBJECT)
      if (extraFor === "Contractor" && contractor) {
        const contractorId =
          typeof contractor === "object" ? contractor.id : contractor;

        const existingContractor = await Contractor.findById(contractorId);
        if (!existingContractor) {
          return res.status(400).json({ message: "Invalid Contractor ID" });
        }

        existingExtraWork.contractor = {
          id: existingContractor._id,
          name: existingContractor.name,
        };

        existingExtraWork.client = undefined;
      }

      // ✅ CLIENT (ID OR OBJECT)
      if (extraFor === "Client" && client) {
        const clientId =
          typeof client === "object" ? client.id : client;

        const existingClient = await Client.findById(clientId);
        if (!existingClient) {
          return res.status(400).json({ message: "Invalid Client ID" });
        }

        existingExtraWork.client = {
          id: existingClient._id,
          name: existingClient.name,
        };

        existingExtraWork.contractor = undefined;
      }
    }

    /* ================================
       ✅ ADD NEW WORK ONLY (NO REPLACE)
    ================================= */
    if (Array.isArray(WorkDetail) && WorkDetail.length > 0) {
      const newWorks = WorkDetail.map((wk) => {
        const rate = Number(wk.rate || 0);
        const area = Number(wk.area || 0);
        const amount = Number(wk.amount || rate * area || 0);

        return {
          work: wk.work,
          rate,
          area,
          unit: wk.unit,
          amount,
          paid: 0,
          due: amount,
          status: "Pending",
          date: wk.date || new Date(),
        };
      });

      existingExtraWork.WorkDetail.push(...newWorks);

      // ✅ Reset approvals ONLY because new work is added
      existingExtraWork.clientApprove = "Pending";
      existingExtraWork.contractorApprove = "Pending";
      existingExtraWork.adminApprove = "Pending";
      existingExtraWork.accountheadApprove = "Pending";
      existingExtraWork.approvalStatus = "Pending";
    }

    /* ================================
       ✅ RE-CALCULATE TOTALS (SAFE)
    ================================= */
    const totalAmount = existingExtraWork.WorkDetail.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalPaid = existingExtraWork.WorkDetail.reduce(
      (sum, item) => sum + Number(item.paid || 0),
      0
    );

    const totalDue = Math.max(totalAmount - totalPaid, 0);

    existingExtraWork.totalAmount = totalAmount;
    existingExtraWork.paid = totalPaid;
    existingExtraWork.due = totalDue;
    existingExtraWork.paymentStatus =
      totalDue === 0 ? "Completed" : "Pending";

    await existingExtraWork.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Extra Work Updated Successfully",
      data: existingExtraWork,
    });
  } catch (error) {
    console.error("Update Extra Work Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const deleteExtraWork = async (req, res) => {
  try {
    const _id = req.params.id;
    const extraWork = await ExtraWork.findByIdAndDelete(_id);
    if (!extraWork)
      return res.status(401).json({ message: "No Extra Work Found" });
    res.status(201).json({ message: "Extra Work Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getWork = async (req, res) => {
  try {
    const id = req.params.id;
    const extraWork = await ExtraWork.findById(id);
    if (!extraWork)
      return res.status(401).json({ message: "No Extra Work Found" });
    const workDetails = extraWork.WorkDetail;
    res.status(201).json(workDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const updateWork = async (req, res) => {
//   try {
//     const { id, index } = req.params;
//     const { work, rate, area, unit, status, date, amount } = req.body;
//     const extraWork = await ExtraWork.findById(id);
//     if (!extraWork)
//       return res.status(401).json({ message: "No Extra Work Found" });
//     extraWork.WorkDetail[index] = {
//       work: work || extraWork.WorkDetail[index].work,
//       rate: rate || extraWork.WorkDetail[index].rate,
//       area: area || extraWork.WorkDetail[index].area,
//       unit: unit || extraWork.WorkDetail[index].unit,
//       date: date || extraWork.WorkDetail[index].date,
//       status: status || extraWork.WorkDetail[index].status,
//       amount: amount || extraWork.WorkDetail[index].amount,
//     };
//     await extraWork.save();
//     res.status(201).json({ message: "Work Detail Updated Successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


const updateWork = async (req, res) => {
  try {
    const { id, index } = req.params;
    const { work, rate, area, unit, date, paid } = req.body;

    const extraWork = await ExtraWork.findById(id);
    if (!extraWork) {
      return res.status(404).json({ message: "No Extra Work Found" });
    }

    // ✅ Index validation
    if (!extraWork.WorkDetail[index]) {
      return res.status(400).json({ message: "Invalid Work Index" });
    }

    const existing = extraWork.WorkDetail[index];

    // ✅ Recalculate amount safely
    const finalRate = rate ?? existing.rate;
    const finalArea = area ?? existing.area;
    const finalAmount = Number(finalRate) * Number(finalArea);

    const finalPaid = paid ?? existing.paid ?? 0;
    const finalDue = finalAmount - finalPaid;

    extraWork.WorkDetail[index] = {
      ...existing,
      work: work ?? existing.work,
      rate: finalRate,
      area: finalArea,
      unit: unit ?? existing.unit,
      date: date ?? existing.date,
      amount: finalAmount,
      paid: finalPaid,
      due: finalDue,
      status: finalDue === 0 ? "Paid" : "Pending",
    };

    // ✅ Recalculate root totals
    const totalAmount = extraWork.WorkDetail.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalPaid = extraWork.WorkDetail.reduce(
      (sum, item) => sum + Number(item.paid || 0),
      0
    );

    const totalDue = totalAmount - totalPaid;

    extraWork.totalAmount = totalAmount;
    extraWork.paid = totalPaid;
    extraWork.due = totalDue;
    extraWork.paymentStatus = totalDue === 0 ? "Completed" : "Pending";

    await extraWork.save();
    res.status(200).json({
      message: "Work Detail Updated Successfully",
      data: extraWork,
    });
  } catch (error) {
    console.error("Update Work Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const deleteWork = async (req, res) => {
  try {
    const { id, index } = req.params;
    const extraWork = await ExtraWork.findById(id);
    if (!extraWork)
      return res.status(401).json({ message: "No Extra Work Found" });
    extraWork.WorkDetail.splice(index, 1);
    await extraWork.save();
    const existingExtraWork = await ExtraWork.find();
    res.status(201).json({
      message: "Work deleted Successfully",
      existingExtraWork,
      extraWork,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getExtraWork,
  getExtraWorks,
  getWork,
  createExtraWork,
  updateExtraWork,
  updateWork,
  deleteExtraWork,
  deleteWork,
  siteExtraWork,
  saveExtraWork,
  getExtraBySiteAndContractor,
};
