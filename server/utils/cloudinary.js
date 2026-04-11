// utils/cloudinary.js

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const safeUnlink = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.log("File delete error:", err.message);
  }
};

const uploadOnCloudinary = async (filePath, options = {}) => {
  try {

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: options.folder || "projects",
      public_id: options.public_id,

      transformation: [
        {
          width: 1600,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    safeUnlink(filePath);

    return result;

  } catch (error) {
    safeUnlink(filePath);
    throw error;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  uploadOnCloudinary,
  deleteFromCloudinary,
};