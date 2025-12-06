const express = require("express");
const WorkOrder = express.Router();
const WorkDetail = express.Router();
const WorkTemplate = express.Router();
const {
  getWorkorder,
  getWorkorders,
  createWorkorder,
  updateWorkOrder,
  deleteWorkOrder,
  siteWorkOrder,
  contractorWorkOrder,
  getWorks,
  updateWork,
  deleteWork,
  getBySiteAndContractor,
  getDraftWorkorders,
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
} = require("../controller/workorder.controller");
const {
  getWorkDetails,
  createWorkDetails,
  deleteWorkDetails,
  deleteDescription,
  updateDescription,
  getWorkDetail,
  updateWorkDetails,
  workDetailByName,
  exportAllWorkDetails,
  exportWorkDetail,
  importWorkDetails,
  updateWorkDetailFromExcel,
} = require("../controller/workDetails.controller");
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/Upload");

// WorkOrder Routes
WorkOrder.get("/", getWorkorders);
WorkOrder.get("/draft", userAuth, getDraftWorkorders);
WorkOrder.get("/:id", getWorkorder);
WorkOrder.get("/export-data/:id", getWorkorder);
WorkOrder.get("/export-data", getWorkorders);
WorkOrder.get("/:id/work", getWorks);
WorkOrder.get("/site/:id", siteWorkOrder);
WorkOrder.get("/contractor/:id", contractorWorkOrder);
WorkOrder.get("/:site/:contractor", getBySiteAndContractor);
WorkOrder.post("/", userAuth, createWorkorder);
WorkOrder.post("/:id/replace-contractor", userAuth, replaceContractor);
WorkOrder.put("/save/:id", userAuth, saveWorkOrder);
WorkOrder.put("/:id", userAuth, updateWorkOrder);
WorkOrder.put("/:id/work/:index", userAuth, updateWork);
WorkOrder.delete("/:id", userAuth, deleteWorkOrder);
WorkOrder.delete("/:id/work/:index", userAuth, deleteWork);

WorkTemplate.route("/")
  .post(adminAuth, createWorkOrderTemplate)
  .get(getAllWorkOrderTemplates);

WorkTemplate.route("/:templateId/description/:index")
  .get(getDescriptionByIndex)
  .put(adminAuth, updateDescriptionByIndex)
  .delete(adminAuth, deleteDescriptionByIndex);

WorkTemplate.route("/:id")
  .get(getWorkOrderTemplateById)
  .put(adminAuth, updateWorkOrderTemplate)
  .delete(adminAuth, deleteWorkOrderTemplate);

// WorkDetail Routes
WorkDetail.post("/imports", upload.single("file"), importWorkDetails);
WorkDetail.get("/export", exportAllWorkDetails);
WorkDetail.get("/", getWorkDetails);
// WorkDetail.get('/export-data/:id', getWorkDetail);
// WorkDetail.get('/export-data', getWorkDetails);
WorkDetail.post("/name", workDetailByName);
WorkDetail.post("/", createWorkDetails);
WorkDetail.get("/:id", getWorkDetail);
WorkDetail.put(
  "/:id/imports",
  upload.single("file"),
  updateWorkDetailFromExcel
);
WorkDetail.get("/:id/export", exportWorkDetail);
WorkDetail.put("/:id/:index", updateDescription);
WorkDetail.put("/:id", updateWorkDetails);
WorkDetail.delete("/:id", deleteWorkDetails);
WorkDetail.delete("/:id/:index", deleteDescription);

module.exports = { WorkOrder, WorkDetail, WorkTemplate };
