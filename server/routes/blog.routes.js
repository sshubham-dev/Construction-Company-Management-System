const express = require("express");
const Blogs = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogBySlug,
  getPublishedBlogs,
  uploadBlogImage
} = require("../controller/blog.controller");
const upload = require('../middlewares/Upload');


// Create a new blog
Blogs.post("/", upload.single("featureImage"), createBlog);
Blogs.post("/blog-image", upload.single("image"), uploadBlogImage);

// Get all blogs
Blogs.get("/", getAllBlogs);
Blogs.get("/public", getPublishedBlogs);
// Get a blog by ID
Blogs.get("/preview/:id", getBlogById);
Blogs.get("/:slug", getBlogBySlug);

// Update a blog by ID
Blogs.put("/:id", upload.single("featureImage"), updateBlog);

// Delete a blog by ID
Blogs.delete("/:id", deleteBlog);

module.exports = Blogs;
// This code defines the routes for managing blog posts in an Express application.
