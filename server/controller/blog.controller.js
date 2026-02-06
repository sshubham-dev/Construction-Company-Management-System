const Blog = require("../models/blog.models");
const { sendNotification } = require("./notification.controller.js");

const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      featuredImage,
      seoTitle,
      seoDescription,
      status,
    } = req.body;

    // Basic validation
    if (!title || !slug || !excerpt || !content) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    // Check slug uniqueness
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        message: "Slug already exists",
      });
    }

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      category,
      featuredImage,
      seoTitle,
      seoDescription,
      status,
      publishedAt: status === "published" ? new Date() : null,
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ updatedAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching blogs", error: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching blog", error: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      seoTitle,
      seoDescription,
    } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        category,
        seoTitle,
        seoDescription,
      },
      { new: true },
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res
      .status(200)
      .json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating blog", error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting blog", error: error.message });
  }
};

/* PUBLIC (WEBSITE) */
const getPublishedBlogs = async (req, res) => {
  const blogs = await Blog.find({ status: "published" }).sort({
    publishedAt: -1,
  });
  res.json(blogs);
};

const getBlogBySlug = async (req, res) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    status: "published",
  });
  res.json(blog);
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getPublishedBlogs,
  getBlogBySlug,
};
