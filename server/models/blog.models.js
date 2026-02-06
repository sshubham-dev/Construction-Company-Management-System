const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true }, // HTML
    category: { type: String },
    featuredImage: { type: String },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },

    seoTitle: String,
    seoDescription: String,

    publishedAt: Date
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;