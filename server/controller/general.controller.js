const {uploadOnCloudinary} = require("../utils/cloudinary.js");

export const uploadBlogImage = async (req, res) => {
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
