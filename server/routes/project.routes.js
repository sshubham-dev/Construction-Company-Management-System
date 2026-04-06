const express = require("express");
const Project = require("../models/project.models");
const {
  createProject,
  getProjects,
  getProject,
} = require("../controller/project.controller");

const Projects = express.Router();

// 1. POST - Add a new project (Called from your App Editor)
Projects.post("/add", createProject);

// 2. GET - Fetch projects for the website
Projects.get("/", getProjects);

// 3. GET Single Project by ID (For your website's beautiful structure page)
Projects.get("/:id", getProject);

module.exports = Projects;
