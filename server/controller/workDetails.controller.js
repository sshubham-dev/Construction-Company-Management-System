const WorkDetails = require("../models/workDetails.models");
const XLSX = require("xlsx");
const { Readable } = require("stream");
const { promisify } = require("util");
const fs = require("fs");
const writeFile = promisify(fs.writeFile);

// controllers/workDetails.controller.js

const importWorkDetails = async (req, res) => {
  try {
    // Get uploaded Excel file (using multer)
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // Read workbook
    const workbook = XLSX.readFile(file.path);
    const sheetNames = workbook.SheetNames;

    const results = [];

    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Each row = [serialNo, work]
      const description = jsonData.slice(1).map((row) => ({
        work: row[1],
      }));

      const existing = await WorkDetails.findOne({ title: sheetName });

      if (existing) {
        existing.description = description;
        await existing.save();
        results.push({ title: sheetName, action: "updated" });
      } else {
        const newWork = await WorkDetails.create({
          title: sheetName,
          description,
        });
        results.push({ title: sheetName, action: "created" });
      }
    }

    res.status(200).json({
      message: "Import completed successfully",
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Import failed", error: error.message });
  }
};

// Helper: clean sheet name to avoid invalid chars and length > 31
const sanitizeSheetName = (name = "Sheet") => {
  // remove these chars: \ / ? * [ ]
  const invalid = /[\\\/\?\*\[\]]/g;
  let clean = String(name).replace(invalid, " ").trim();
  if (clean.length === 0) clean = "Sheet";
  if (clean.length > 31) clean = clean.slice(0, 31);
  return clean;
};

// ✅ EXPORT (to Excel sheets)
const exportAllWorkDetails = async (req, res) => {
  try {
    const all = await WorkDetails.find().lean();

    const workbook = XLSX.utils.book_new();

    if (!all.length) {
      // create an empty sheet to avoid empty file
      const ws = XLSX.utils.json_to_sheet([{ "Serial No": 1, Work: "" }]);
      XLSX.utils.book_append_sheet(workbook, ws, sanitizeSheetName("No Data"));
    } else {
      all.forEach((doc) => {
        const sheetName = sanitizeSheetName(doc.title);
        const rows = (doc.description || []).map((d, i) => ({
          "Serial No": i + 1,
          Work: d.work ?? "",
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, ws, sheetName);
      });
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="work_details_all.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("Export all error:", err);
    return res
      .status(500)
      .json({ message: "Export failed", error: err.message });
  }
};

const exportWorkDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await WorkDetails.findById(id).lean();
    if (!doc) return res.status(404).json({ message: "Work detail not found" });

    const workbook = XLSX.utils.book_new();
    const sheetName = sanitizeSheetName(doc.title);
    const rows = (doc.description || []).map((d, i) => ({
      "Serial No": i + 1,
      Work: d.work ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // create a file-name safe version of title
    const filenameSafeTitle = sheetName.replace(/\s+/g, "_");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="work_details_${filenameSafeTitle}.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("Export one error:", err);
    return res
      .status(500)
      .json({ message: "Export failed", error: err.message });
  }
};

const getWorkDetails = async (req, res) => {
  try {
    const workDetails = await WorkDetails.find();
    if (workDetails.length === 0)
      return res.status(404).json({ error: "Work details not found" });
    return res.status(200).json(workDetails);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getWorkDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const workDetail = await WorkDetails.findById(id);
    if (!workDetail)
      return res.status(404).json({ error: "No Work detail found" });
    return res.status(200).json(workDetail);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const workDetailByName = async (req, res) => {
  try {
    const title = req.body;
    // console.log(title)
    const workDetail = await WorkDetails.findOne(title);

    if (!workDetail) {
      return res.status(404).json({ error: "No Work detail found" });
    }

    return res.status(200).json(workDetail);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createWorkDetails = async (req, res) => {
  try {
    // console.log('Request received:', req.body);
    const { title, description } = req.body;

    const existingWork = await WorkDetails.findOne({ title });
    if (existingWork) {
      return res
        .status(400)
        .json({ error: "Work detail with this title already exists" });
    }
    const newWork = new WorkDetails({ title, description });
    const savedWork = await newWork.save();
    if (!savedWork) {
      return res.status(500).json({ error: "Failed to create work details" });
    }
    console.log(savedWork);
    return res
      .status(200)
      .json({ message: "Work created successfully", savedWork });
  } catch (error) {
    console.log("Error creating work details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateWorkDetails = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("update:", id);
    const { title, description } = req.body;

    const existingWorkDetail = await WorkDetails.findById(id);
    if (!existingWorkDetail) {
      return res.status(404).json({ message: "No Work detail found" });
    }
    // console.log(description[0])
    (existingWorkDetail.title = title || existingWorkDetail.title),
      existingWorkDetail.description.push(description[0]),
      await existingWorkDetail.save();

    return res
      .status(200)
      .json({ message: "Work detail updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const updateDescription = async (req, res) => {
  try {
    const id = req.params.id;
    const index = req.params.index;
    // console.log('update:', id, index)
    const { description } = req.body;

    const existingWorkDetail = await WorkDetails.findById(id);
    if (!existingWorkDetail) {
      return res.status(404).json({ message: "No Work detail found" });
    }
    console.log(description);
    existingWorkDetail.description[index] = description[0] || existingWorkDetail.description[index];
    existingWorkDetail.markModified("description");
    await existingWorkDetail.save();

    return res
      .status(200)
      .json({ message: "Work detail updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const deleteWorkDetails = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("id", id);
    const deletedWorkDetail = await WorkDetails.findByIdAndDelete(id);
    if (!deletedWorkDetail)
      return res.status(404).json({ error: "No Work detail found" });
    console.log("deletedWorkDetail", deletedWorkDetail);
    return res
      .status(200)
      .json({ message: "Work detail deleted Successfuly", deletedWorkDetail });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteDescription = async (req, res) => {
  try {
    const { id, index } = req.params;
    const deletedWorkDetail = await WorkDetails.findById(id);
    if (!deletedWorkDetail)
      return res.status(404).json({ error: "No Work detail found" });
    deletedWorkDetail.description.splice(index, 1);
    await deletedWorkDetail.save();
    const workDetails = await WorkDetails.find();
    return res
      .status(200)
      .json({ message: "Work detail deleted Successfuly", workDetails });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateWorkDetailFromExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // Read workbook
    const workbook = XLSX.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]]; // assume first sheet
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Remove header and convert to [{ work: "..." }]
    const description = jsonData.slice(1).map((row) => ({
      work: row[1],
    }));

    // Update existing work detail
    const updated = await WorkDetails.findByIdAndUpdate(
      id,
      { description },
      { new: true }
    );

    // Delete uploaded file
    fs.unlinkSync(file.path);

    if (!updated) {
      return res.status(404).json({ message: "Work detail not found" });
    }

    res.status(200).json({
      message: "Work detail updated successfully from Excel",
      workDetail: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

module.exports = {
  getWorkDetails,
  getWorkDetail,
  createWorkDetails,
  updateWorkDetails,
  updateDescription,
  deleteWorkDetails,
  deleteDescription,
  workDetailByName,
  exportAllWorkDetails,
  exportWorkDetail,
  importWorkDetails,
  updateWorkDetailFromExcel
};
