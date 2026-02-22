const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv").config();
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, options = {}) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: options.folder || "general",

      // 👇 optional SEO naming
      public_id: options.public_id,

      // 👇 optimize images automatically
      transformation: [
        {
          width: 1600,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });
    if (response) {
      console.log("response:", response);
      fs.unlinkSync(localFilePath);
      return response;
    }
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);

    console.log("Deleted:", publicId);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  uploadOnCloudinary,
  deleteFromCloudinary,
};
