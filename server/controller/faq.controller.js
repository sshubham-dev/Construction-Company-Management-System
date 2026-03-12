const FAQ = require("../models/faq.models");
const mongoose = require("mongoose");

/*
CREATE FAQ
*/

const createFaq = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);

    res.status(201).json({
      success: true,
      data: faq,
    });
  } catch (err) {
    console.log('faq', err)
    res.status(500).json({ message: err.message });
  }
};

/*
UPDATE FAQ
*/

const updateFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      success: true,
      data: faq,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
DELETE FAQ
*/

const deleteFaq = async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "FAQ deleted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
GET ALL FAQ (ADMIN)
*/

const getAllFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: faqs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
GET FAQ BY SERVICE
*/

const getServiceFaqs = async (req, res) => {
  try {
    const { serviceId, limit = 6 } = req.query;

    const faqs = await FAQ.aggregate([
      {
        $match: {
          serviceId: new mongoose.Types.ObjectId(serviceId),
          isActive: true,
        },
      },
      {
        $sample: { size: parseInt(limit) },
      },
    ]);

    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
GET FAQ BY BLOG
*/

const getBlogFaqs = async (req, res) => {
  try {
    const { blogId } = req.query;

    const faqs = await FAQ.find({
      blogId,
      isActive: true,
    });

    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
GET RANDOM FAQ BY CATEGORY
*/

const getCategoryFaqs = async (req, res) => {
  try {
    const { category, limit = 5 } = req.query;

    const faqs = await FAQ.aggregate([
      {
        $match: {
          category,
          isActive: true,
        },
      },
      {
        $sample: { size: parseInt(limit) },
      },
    ]);

    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createFaq,
  updateFaq,
  deleteFaq,
  getAllFaqs,
  getServiceFaqs,
  getBlogFaqs,
  getCategoryFaqs,
};
