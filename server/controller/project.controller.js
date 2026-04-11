const Project = require("../models/project.models");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

/* SLUG */
const generateSlug = (title) =>
  title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

/*
CREATE PROJECT
*/
const createProject = async (req, res) => {
  try {

    const files = req.files;
    const data = req.body;

    /* SLUG */
    if (!data.slug && data.title) {
      data.slug = generateSlug(data.title);
    }

    /* COVER IMAGE */
    if (files?.coverImage) {
      const result = await uploadOnCloudinary(files.coverImage[0].path, {
        folder: "projects/cover",
        public_id: `${data.slug}-cover`,
      });

      data.coverImage = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    }

    /* FLOOR PLAN */
    if (files?.floorPlan) {
      const result = await uploadOnCloudinary(files.floorPlan[0].path, {
        folder: "projects/floorplans",
        public_id: `${data.slug}-floorplan`,
      });

      data.floorPlan = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    }

    /* GALLERY */
    if (files?.galleryImages) {
      data.galleryImages = [];

      let index = 1;

      for (const file of files.galleryImages) {
        const result = await uploadOnCloudinary(file.path, {
          folder: "projects/gallery",
          public_id: `${data.slug}-gallery-${index++}`,
        });

        data.galleryImages.push({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    /* VIDEO (optional upload) */
    if (files?.video) {
      const result = await uploadOnCloudinary(files.video[0].path, {
        folder: "projects/video",
        public_id: `${data.slug}-video`,
      });

      data.video = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    }

    /* SEO */
    if (data.seo && typeof data.seo.keywords === "string") {
      data.seo.keywords = data.seo.keywords.split(",").map(k => k.trim());
    }

    const project = await Project.create(data);

    res.status(201).json({
      success: true,
      data: project,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/*
UPDATE PROJECT
*/
const updateProject = async (req, res) => {
  try {

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const data = req.body;
    const files = req.files;

    /* SLUG UPDATE */
    if (data.title) {
      data.slug = generateSlug(data.title);
    }

    /* COVER IMAGE */
    if (files?.coverImage) {

      if (project.coverImage?.public_id) {
        await deleteFromCloudinary(project.coverImage.public_id);
      }

      const result = await uploadOnCloudinary(files.coverImage[0].path, {
        folder: "projects/cover",
      });

      data.coverImage = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    }

    /* FLOOR PLAN */
    if (files?.floorPlan) {

      if (project.floorPlan?.public_id) {
        await deleteFromCloudinary(project.floorPlan.public_id);
      }

      const result = await uploadOnCloudinary(files.floorPlan[0].path, {
        folder: "projects/floorplans",
      });

      data.floorPlan = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    }

    /* GALLERY FULL REPLACE */
    if (files?.galleryImages) {

      for (const img of project.galleryImages || []) {
        await deleteFromCloudinary(img.public_id);
      }

      data.galleryImages = [];

      for (const file of files.galleryImages) {
        const result = await uploadOnCloudinary(file.path, {
          folder: "projects/gallery",
        });

        data.galleryImages.push({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    /* SEO */
    if (data.seo && typeof data.seo.keywords === "string") {
      data.seo.keywords = data.seo.keywords.split(",");
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    res.json({
      success: true,
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
DELETE PROJECT
*/
const deleteProject = async (req, res) => {
  try {

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Not found" });
    }

    /* DELETE MEDIA */

    if (project.coverImage?.public_id) {
      await deleteFromCloudinary(project.coverImage.public_id);
    }

    if (project.floorPlan?.public_id) {
      await deleteFromCloudinary(project.floorPlan.public_id);
    }

    for (const img of project.galleryImages || []) {
      await deleteFromCloudinary(img.public_id);
    }

    if (project.video?.public_id) {
      await deleteFromCloudinary(project.video.public_id);
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
GET PROJECTS
*/
const getProjects = async (req, res) => {
  try {
    const { projectType, city } = req.query;

    let filter = {};

    if (projectType) filter.projectType = projectType;
    if (city) filter.city = city;

    const projects = await Project.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
GET SINGLE PROJECT BY ID
*/
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 GET PROJECT BY SLUG (SEO PAGE)
*/
const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  getProjectBySlug,
  updateProject,
  deleteProject,
};
