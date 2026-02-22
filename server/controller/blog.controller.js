const Blog = require("../models/blog.models");
const { sendNotification } = require("./notification.controller.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
// const { makeSlug } = require("../utils/slugify.js");

const makeSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

const createBlog = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      content,
      category,
      seoTitle,
      seoDescription,
      status,
      featureImage, // 👈 URL already uploaded
    } = req.body;

    const slug = req.body.slug || makeSlug(title);

    if (!title || !slug || !content) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        message: "Slug already exists",
      });
    }

    const blog = await Blog.create({
      title,
      slug,
      shortDescription,
      content,
      category,
      featureImage, // 👈 save directly
      seoTitle,
      seoDescription,
      status,
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
    // console.log("blogs", blogs);
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
    console.log(req.params.id);
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // console.log("blog", blog);
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
      shortDescription,
      content,
      category,
      seoTitle,
      seoDescription,
      status,
      featureImage
    } = req.body;
    // console.log("req u", req.body);
    console.log("image", featureImage);

    const slug = req.body.slug || makeSlug(req.body.title);

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        shortDescription,
        content,
        category,
        featureImage,
        seoTitle,
        seoDescription,
        status,
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
    await cloudinary.uploader.destroy(deletedBlog.featureImage);
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
    createdAt: -1,
  });
  res.json(blogs);
};

const getBlogBySlug = async (req, res) => {
  console.log(req.params.slug);
  const blog = await Blog.findOne({
    slug: req.params.slug,
    // status: "published",
  });
  res.json(blog);
};

const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const slug = req.body.slug || "blog";
    const upload = await uploadOnCloudinary(req.file.path, {
      folder: "blogs/content",
      public_id: `${slug}-${Date.now()}`,
    });
    res.status(200).json({
      url: upload?.secure_url, // Cloudinary CDN URL
      public_id: upload?.public_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getPublishedBlogs,
  getBlogBySlug,
  uploadBlogImage,
};
