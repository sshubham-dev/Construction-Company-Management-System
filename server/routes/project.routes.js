const express = require("express");
const {
  createProject,
  getProjects,
  getProject,
  getPublishedProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} = require("../controller/project.controller");

const Projects = express.Router();
const upload = require("../middlewares/Upload");

// 1. POST - Add a new project (Called from your App Editor)
Projects.post(
  "/add",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "floorPlan", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  createProject,
);

// 2. GET - Fetch projects for the website
Projects.get("/", getProjects);
Projects.get("/public", getPublishedProjects);

Projects.put(
  "/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "floorPlan", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  updateProject,
);

// 3. GET Single Project by ID (For your website's beautiful structure page)
Projects.get("/:id", getProject);
Projects.delete("/:id", deleteProject);

module.exports = Projects;
