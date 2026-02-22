const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },

    shortDescription: String,

    featureImage: {
      secure_url: String,
      public_id: String,
    },

    category: {
      type: String,
      enum: ["architecture", "construction", "interior"],
    },

    seoTitle: String,
    seoDescription: String,

    content: Object,
    // store editor JSON (TipTap / EditorJS)

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true },
);

const Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;
