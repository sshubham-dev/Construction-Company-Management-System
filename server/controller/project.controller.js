const Project = require("../models/project.models");

// 1. POST - Add a new project (Called from your App Editor)
const createProject = async (req, res) => {
  try {
    const newProject = new Project(req.body);
    const savedProject = await newProject.save();
    res.status(201).json({ success: true, data: savedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET - Fetch projects for the website
const getProjects = async (req, res) => {
  try {
    // Optional: filter by category if passed in query (e.g., ?type=Interior)
    const filter = req.query.type ? { projectType: req.query.type } : {};
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET Single Project by ID (For your website's beautiful structure page)
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Project not found" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
};
