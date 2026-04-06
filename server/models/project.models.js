const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Common Fields for ALL projects
  title: { type: String, required: true }, // Cover page title
  projectType: { 
    type: String, 
    required: true, 
    enum: ['Design', 'Completed Construction', 'Ongoing Construction', 'Upcoming Construction', 'Interior'] 
  },
  description: { type: String, required: true },
  purpose: { type: String }, // e.g., Residential, Commercial
  coverImage: { type: String, required: true }, // Cloudinary URL
  galleryImages: [{ type: String }], // Array of Cloudinary URLs
  documentUrl: { type: String }, // PDF/DWG Cloudinary URL
  youtubeUrl: { type: String }, // New YouTube Link Field
  budget: { type: String }, 
  
  // Design & Construction Specific Fields
  plotSize: { type: String },
  direction: { type: String }, // e.g., East-Facing
  numberOfFloors: { type: Number },
  designRateList: { type: String }, // Link or text for design rates
  
  // Interior Specific Fields
  area: { type: String }, // e.g., 1500 sq ft
  theme: { type: String }, // e.g., Modern Minimalist
  interiorRateList: { type: String }, // Link or text for interior rates

  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;