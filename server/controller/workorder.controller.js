const { WorkOrder, WorkOrderTemplate } = require("../models/workorder.models");
const Site = require("../models/site.models");
const Contractor = require("../models/contractor.models");
const WorkDetails = require("../models/workDetails.models");
const User = require("../models/user.models.js");
const mongoose = require("mongoose");
const {
  sendApproveByAdmin,
  sendApproveByAccountant,
  sendApproveByAccountHead,
  sendApproveByIncharge,
  sendApproveByContractor,
} = require("./approval.controller.js");
const { sendNotification } = require("./notification.controller.js");

const recalcTotals = (works = []) => {
  const totalValue = works.reduce((s, w) => s + (Number(w.amount) || 0), 0);
  const totalPaid = works.reduce((s, w) => s + (Number(w.paid) || 0), 0);
  const totalDue = Number((totalValue - totalPaid).toFixed(2));
  return {
    totalValue: Number(totalValue.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    totalDue,
  };
};

const getWorkorders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      // .where("adminApprove")
      // .equals("Approved")
      .where("approvalStatus")
      .equals("Approved")
      .exec();
    if (workOrders.length === 0) {
      return res.status(404).json({ error: "No Work-Orders Found" });
    }
    return res.status(200).json(workOrders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getDraftWorkorders = async (req, res) => {
  try {
    const user = req.user;
    console.log("user in draft workorders:", user._id);
    const workOrders = await WorkOrder.find({ createdBy: user?._id })
      .where("approvalStatus")
      .equals("Pending")
      // .where("createdBy")
      // .equals(user?._id)
      .sort({ createdAt: -1 })
      .exec();
    if (workOrders.length === 0) {
      return res.status(404).json({ error: "No Work-Orders Found" });
    }
    return res.status(200).json(workOrders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getWorkorder = async (req, res) => {
  try {
    const id = req.params.id;
    const workOrder = await WorkOrder.findById(id).populate("site.id").exec();
    if (!workOrder) {
      return res.status(404).json({ error: "Work-Order not Found" });
    }
    return res.status(200).json(workOrder);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const siteWorkOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const workOrders = await WorkOrder.find()
      // .where("adminApprove")
      // .equals("Approved")
      .where("approvalStatus")
      .equals("Approved")
      .where("site.id")
      .equals(id)
      .exec();
    if (workOrders.length === 0) {
      return res.status(404).json({ error: "No Work-Orders Found" });
    }
    return res.status(201).json(workOrders);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getBySiteAndContractor = async (req, res) => {
  try {
    const { contractor, site } = req.params;
    console.log(contractor);
    console.log(site);
    const workOrders = await WorkOrder.find()
      .where("approvalStatus")
      .equals("Approved")
      .where("site.id")
      .equals(site)
      .where("contractor.id")
      .equals(contractor)
      .exec();
    if (workOrders.length === 0) {
      return res.status(404).json({ error: "No Work-Orders Found" });
    }
    console.log(workOrders);
    return res.status(201).json(workOrders);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const contractorWorkOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const workOrders = await WorkOrder.find()
      .where("adminApprove")
      .equals("Approved")
      .where("approvalStatus")
      .equals("Approved")
      .where("contractor.id")
      .equals(id)
      .exec();
    if (workOrders.length === 0) {
      return res.status(404).json({ error: "No Work-Orders Found" });
    }
    return res.status(201).json(workOrders);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const createWorkorder = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const {
      templateRef,
      contractor,
      site: siteId,
      startDate,
      durationMonths,
      works,
      workOrderName,
    } = req.body;

    // validate
    if (!templateRef && (!works || !works.length)) {
      return res
        .status(400)
        .json({ message: "Either templateRef or works is required" });
    }
    if (!contractor || !siteId)
      return res.status(400).json({ message: "Contractor and Site required" });

    const site = await Site.findById(siteId).lean();
    if (!site) return res.status(400).json({ message: "Site not found" });
    const existingContractor = await Contractor.findById(contractor);
    console.log(existingContractor);
    if (!existingContractor)
      return res.status(400).json({ message: "Contractor not found" });

    // load template if provided
    const template = templateRef
      ? await WorkOrderTemplate.findById(templateRef).lean()
      : null;

    // compute serial number for naming
    const existingCount = await WorkOrder.countDocuments({
      "site.id": site._id,
      templateRef: templateRef,
    });
    const serial = existingCount + 1;
    const autoName = `${
      (template && template.title) || workOrderName || "Work Order"
    } - ${site.name} - ${String(serial).padStart(3, "0")}`;

    // create doc
    const newWO = new WorkOrder({
      workOrderName: autoName,
      workOrderNo: `WO-${serial}`,
      contractor: { id: existingContractor._id, name: existingContractor.name },
      site: { id: site._id, name: site.name },
      createdBy: user._id,
      templateRef: templateRef || template._id,
      startDate: startDate,
      durationMonths: durationMonths,
      works,
    });

    const saved = await newWO.save();

    // notify employees (same as your existing logic)
    const existingUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    const employees = await User.find({ role: "Employee" });
    for (const emp of employees) {
      sendNotification(
        emp._id,
        `A ${saved.workOrderName} Work Order for ${site.name} has been created by ${existingUser.userName}.`
      );
      emp.notification.push({
        title: "Work Order Created",
        message: `${existingUser.userName} created WO ${saved.workOrderName} for site ${site.name}`,
        link: `/work-order/${saved._id}`,
        createdAt: new Date(),
      });
      await emp.save();
    }
    sendApproveByContractor(saved, "Work Order", user._id);
    sendApproveByAccountHead(saved, "Work Order", user._id);
    sendApproveByAdmin(saved, "Work Order", user._id);

    return res.status(201).json({
      message: "Work Order Created Successfully",
      workOrderId: saved._id,
      workOrder: saved,
    });
  } catch (err) {
    console.error("createWorkorder error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

const saveWorkOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const workOrder = await WorkOrder.findById(id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    // console.log(workOrder)
    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found" });
    }
    if (
      workOrder.accountheadApprove === "Approved" &&
      workOrder.adminApprove === "Approved"
    ) {
      workOrder.approvalStatus = "Approved";
      await workOrder.save();
      const existingSite = await Site.findById(workOrder?.site.id);
      const existingContractor = await Contractor.findById(
        workOrder?.contractor.id
      );
      if (!existingSite.workOrder.includes(workOrder._id)) {
        existingSite.workOrder.push(workOrder._id);
        existingSite.contractor.push({
          id: existingContractor._id,
          name: existingContractor.name,
        });
        await existingSite.save({ validateBeforeSave: false });
      }

      if (!existingContractor.workOrder.includes(workOrder._id)) {
        existingContractor.workOrder.push(workOrder._id);
        existingContractor.site.push({
          id: existingSite._id,
          name: existingSite.name,
        });
        await existingContractor.save({ validateBeforeSave: false });
      }

      return res
        .status(200)
        .json({ message: "Work Order Saved Successfully", workOrder });
    } else {
      return res
        .status(501)
        .json({ message: "Work Order is not approved", workOrder }); //status code 501 not implemented
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      works,
      workOrderName,
      contractor,
      site,
      startDate,
      durationMonths,
      templateRef,
    } = req.body;
    const user = req.user;
    const wo = await WorkOrder.findById(id);
    if (!wo) return res.status(404).json({ message: "Work Order not found" });

    const existingSite = await Site.findById(site).lean();
    if (!site) return res.status(400).json({ message: "Site not found" });
    const existingContractor = await Contractor.findById(contractor);
    console.log(existingContractor);
    if (!existingContractor)
      return res.status(400).json({ message: "Contractor not found" });

    const template = templateRef
      ? await WorkOrderTemplate.findById(templateRef).lean()
      : null;

    const autoName = `${
      (template && template.title) || workOrderName || "Work Order"
    } - ${existingSite.name} - ${String(wo.workOrderNo).padStart(3, "0")}`;

    // create doc
    (wo.workOrderName = autoName),
      (wo.workOrderNo = wo.workOrderNo),
      (wo.contractor = {
        id: existingContractor._id,
        name: existingContractor.name,
      }),
      (wo.site = { id: existingSite._id, name: existingSite.name }),
      (wo.createdBy = user._id),
      (wo.templateRef = templateRef || template._id),
      (wo.startDate = startDate),
      (wo.durationMonths = durationMonths),
      (wo.works = works),
      await wo.save();
    // update meta fields
    // Object.assign(wo, rest);

    // if (Array.isArray(works)) {
    //   wo.works = recalcWorkItem(works);
    // }

    // Object.assign(wo, recalcTotals(wo.works));

    await wo.save();
    const employees = await User.find({ role: "Employee" });
    for (const emp of employees) {
      sendNotification(
        emp._id,
        `${user.userName} has updated the ${wo.workOrderName} of ${existingSite.name}`
      );
      emp.notification.push({
        title: "Work Order Updated",
        message: `${user.userName} has updated the ${wo.workOrderName} of ${existingSite.name}`,
        link: `/work-order/${wo._id}`,
        createdAt: new Date(),
      });
      await emp.save();
    }
    sendApproveByAccountHead(wo, "Work Order", user._id);
    sendApproveByAdmin(wo, "Work Order", user._id);
    res.status(200).json({ message: "Updated", workOrder: wo });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// POST /api/v1/work-order/:id/replace-contractor
const replaceContractor = async (req, res) => {
  try {
    const { id } = req.params;
    const { newContractorId, reason } = req.body;
    const user = req.user;
    if (!newContractorId)
      return res.status(400).json({ message: "newContractorId required" });

    const wo = await WorkOrder.findById(id);
    if (!wo) return res.status(404).json({ message: "WorkOrder not found" });

    // mark old as terminated
    wo.approvalStatus = "Rejected";
    wo.termination = {
      by: user._id,
      date: new Date(),
      reason: reason || "Contractor replaced",
    };
    await wo.save();

    // create new WO with remaining amounts (unpaid stages)
    const remainingWorks = wo.works
      .map((w) => {
        const remainingStages = (w.stages || [])
          .map((s) => {
            const amount = Number(s.amount) || 0;
            const paid = Number(s.paid) || 0;
            const due = Number((amount - paid).toFixed(2));
            if (due <= 0) return null;
            return {
              ...(s.toObject ? s.toObject() : s),
              paid: 0,
              due,
              status: "Pending",
            };
          })
          .filter(Boolean);

        if (remainingStages.length === 0) return null;

        const amount = remainingStages.reduce(
          (sum, st) => sum + Number(st.amount || 0),
          0
        );

        return {
          id: new mongoose.Types.ObjectId().toString(),
          name: w.name,
          unit: w.unit,
          qty: w.qty,
          rate: w.rate,
          amount,
          paid: 0,
          due: amount,
          subWorks: w.subWorks || [],
          stages: remainingStages,
          notes: `Carried from WO ${wo.workOrderNo}`,
        };
      })
      .filter(Boolean);

    const newWO = new WorkOrder({
      workOrderName: `${wo.workOrderName} - REASSIGN`,
      contractor: {
        id: newContractorId,
        name: (await Contractor.findById(newContractorId)).name,
      },
      site: wo.site,
      createdBy: user._id,
      templateRef: wo.templateRef,
      startDate: new Date(),
      durationMonths: wo.durationMonths,
      works: remainingWorks,
      totalValue: remainingWorks.reduce(
        (s, r) => s + (Number(r.amount) || 0),
        0
      ),
      totalPaid: 0,
      totalDue: remainingWorks.reduce((s, r) => s + (Number(r.amount) || 0), 0),
    });
    await newWO.save();
    return res.status(201).json({
      message: "Contractor replaced; new WO created",
      newWorkOrderId: newWO._id,
    });
  } catch (err) {
    console.error("replaceContractor err", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

const deleteWorkOrder = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("id", id);
    const user = req.user;
    const workOrder = await WorkOrder.findByIdAndDelete(id);
    console.log("workOrder", workOrder);
    if (!workOrder) {
      return res.status(500).json({ error: "Something went wrong" });
    }
    const existingSite = await Site.findById({ _id: workOrder.site.id });
    if (!existingSite) {
      return res.status(400).json({ error: "Site not found" });
    }
    const existingContractor = await Contractor.findById(
      workOrder.contractor.id
    );
    if (!existingContractor) {
      console.log("Contractor not found");
      return res.status(400).json({ error: "Contractor not found" });
    }
    existingSite.workOrder.splice(workOrder._id, 1);
    existingSite.contractor.splice(existingContractor._id, 1);
    await existingSite.save({ validateBeforeSave: false });
    existingContractor.workOrder.splice(workOrder._id, 1);
    existingContractor.site.splice(existingSite._id, 1);
    await existingContractor.save({ validateBeforeSave: false });
    return res.status(200).json({ message: "Work Order Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getWorks = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id)
    const workOrder = await WorkOrder.findById(id)
      .populate("site.id")
      .populate("contractor.id")
      .exec();
    // console.log(workOrder)
    if (!workOrder && workOrder.work.length === 0) {
      return res
        .status(404)
        .json({ error: "No Work Order & Work Details Found" });
    }
    const workDetail = workOrder.work;
    return res.status(200).json({ workDetail, workOrder });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateWork = async (req, res) => {
  try {
    const { id, workId } = req.params;
    const update = req.body;

    const wo = await WorkOrder.findById(id);
    if (!wo) return res.status(404).json({ message: "Work Order not found" });

    const idx = wo.works.findIndex((w) => w.id === workId);
    if (idx === -1)
      return res.status(404).json({ message: "Work item not found" });

    // wo.works[idx] = recalcWorkItem({ ...wo.works[idx], ...update });

    Object.assign(wo, recalcTotals(wo.works));
    await wo.save();

    res.status(200).json({
      message: "Work updated",
      work: wo.works[idx],
      totals: {
        totalValue: wo.totalValue,
        totalPaid: wo.totalPaid,
        totalDue: wo.totalDue,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const deleteWork = async (req, res) => {
  try {
    const id = req.params.id;
    const index = req.params.index;
    const user = req.user;
    const workOrder = await WorkOrder.findById(id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    if (!workOrder)
      return res.status(500).json({ error: "Something went wrong" });
    workOrder.work.splice(index, 1);
    await workOrder.save();
    const workDetail = workOrder.work;
    res
      .status(201)
      .json({ message: "Work Detail Deleted Successfully", workDetail });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// ---------------- CREATE ----------------
const createWorkOrderTemplate = async (req, res) => {
  try {
    const { title, trade, description } = req.body;

    // Validation
    if (!title || !trade) {
      return res.status(400).json({ message: "Title and trade are required" });
    }
    if (!Array.isArray(description) || description.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one work description is required" });
    }

    // Duplicate check
    const exists = await WorkOrderTemplate.findOne({ title: title.trim() });
    if (exists) {
      return res
        .status(400)
        .json({ message: "A template with this title already exists" });
    }

    // Clean each description object
    const cleanedDescriptions = description.map((d, i) => {
      if (!d.name || !d.scope) {
        throw new Error(`Description #${i + 1}: name and scope are required`);
      }

      // clean stages
      const stages = (d.paymentSchedule || [])
        .filter((s) => s.stage?.trim())
        .map((s) => ({
          stage: s.stage.trim(),
          percentage: Number(s.percentage) || 0,
        }));

      // validate sum = 100
      const sum = stages.reduce((t, s) => t + Number(s.percentage), 0);
      if (sum !== 100) {
        throw new Error(
          `Description #${
            i + 1
          } payment schedule must total 100%. Found: ${sum}`
        );
      }

      // clean sub works
      const sub = (d.subWorks || [])
        .filter((s) => s.name?.trim())
        .map((s) => ({
          name: s.name.trim(),
          included: !!s.included,
        }));

      return {
        name: d.name.trim(),
        unit: d.unit || "SQFT",
        rate: Number(d.rate) || 0,
        scope: d.scope,
        selectable: d.scope === "selectable" ? true : false,
        subWorks: sub,
        paymentSchedule: stages,
      };
    });

    const template = new WorkOrderTemplate({
      title: title.trim(),
      trade: trade.trim().toLowerCase(),
      description: cleanedDescriptions,
    });

    const saved = await template.save();

    res.status(201).json({
      message: "Work Order Template created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error creating Template:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET ALL ----------------
const getAllWorkOrderTemplates = async (req, res) => {
  try {
    const data = await WorkOrderTemplate.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET ONE ----------------
const getWorkOrderTemplateById = async (req, res) => {
  try {
    const template = await WorkOrderTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- UPDATE ----------------
const updateWorkOrderTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, trade, description } = req.body;

    const template = await WorkOrderTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    template.title = title?.trim() || template.title;
    template.trade = trade?.trim()?.toLowerCase() || template.trade;

    if (Array.isArray(description)) {
      template.description = description;
    }

    const saved = await template.save();

    res.status(200).json({
      message: "Template updated successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- DELETE ----------------
const deleteWorkOrderTemplate = async (req, res) => {
  try {
    const deleted = await WorkOrderTemplate.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET ONE DESCRIPTION ----------------
const getDescriptionByIndex = async (req, res) => {
  try {
    const { templateId, index } = req.params;
    const template = await WorkOrderTemplate.findById(templateId);

    if (!template)
      return res.status(404).json({ message: "Template not found" });

    const idx = Number(index);
    if (idx < 0 || idx >= template.description.length) {
      return res.status(400).json({ message: "Invalid description index" });
    }

    res.status(200).json(template.description[idx]);
  } catch (error) {
    console.error("Error fetching description:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- UPDATE ONE DESCRIPTION ----------------
const updateDescriptionByIndex = async (req, res) => {
  try {
    const { templateId, index } = req.params;
    const update = req.body;

    const template = await WorkOrderTemplate.findById(templateId);
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    const idx = Number(index);
    if (idx < 0 || idx >= template.description.length) {
      return res.status(400).json({ message: "Invalid description index" });
    }

    Object.assign(template.description[idx], update);

    await template.save();

    res.status(200).json({
      message: "Description updated",
      data: template.description[idx],
    });
  } catch (error) {
    console.error("Error updating description:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- DELETE ONE DESCRIPTION ----------------
const deleteDescriptionByIndex = async (req, res) => {
  try {
    const { templateId, index } = req.params;
    const template = await WorkOrderTemplate.findById(templateId);

    if (!template)
      return res.status(404).json({ message: "Template not found" });

    const idx = Number(index);
    if (idx < 0 || idx >= template.description.length) {
      return res.status(400).json({ message: "Invalid index" });
    }

    template.description.splice(idx, 1);

    await template.save();

    res.status(200).json({ message: "Description removed" });
  } catch (error) {
    console.error("Error deleting description:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkorder,
  getWorkorders,
  createWorkorder,
  updateWorkOrder,
  deleteWorkOrder,
  siteWorkOrder,
  contractorWorkOrder,
  getBySiteAndContractor,
  getWorks,
  getDraftWorkorders,
  updateWork,
  deleteWork,
  saveWorkOrder,
  createWorkOrderTemplate,
  getAllWorkOrderTemplates,
  getWorkOrderTemplateById,
  updateWorkOrderTemplate,
  deleteWorkOrderTemplate,
  getDescriptionByIndex,
  updateDescriptionByIndex,
  deleteDescriptionByIndex,
  replaceContractor,
};
