const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  // Common Fields for ALL projects
  title: { type: String, required: true }, // Cover page title
  slug: { type: String, unique: true },
  shortDescription: { type: String }, // 150-200 words
  description: { type: String, required: true }, // full detail 800+ words

  purpose: { type: String }, // e.g., Residential, Commercial
  projectType: {
    type: String,
    required: true,
  },
  subType: {
    type: String,
    // duplex / apartment / farmhouse / restaurant / hotel etc.
  },
  theme: { type: String }, // e.g., Modern Minimalist

  /* LOCATION */
  city: String,
  area: String,

  // PROJECT Specific Fields
  plotSize: { type: String },
  builtup: { type: Number },
  floors: { type: Number },
  configuration: { type: String },
  direction: { type: String }, // e.g., East-Facing

  // Deisgn & Technical Details
  coverImage: {
    secure_url: String,
    public_id: String,
  }, // Cloudinary URL
  floorPlan: {
    secure_url: String,
    public_id: String,
  }, // PDF/DWG Cloudinary URL
  galleryImages: [
    {
      secure_url: String,
      public_id: String,
    },
  ], // Array of Cloudinary URLs
  video: {
    secure_url: String,
    public_id: String,
  }, // New Link Field

  budget: { type: String },
  budgetType: { type: String },

  // Interior Specific Fields
  rateList: { type: String }, // Link or text for design rates

  /* SEO */
  seo: {
    title: String,
    description: String,
    keywords: [String],
  },
});

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
