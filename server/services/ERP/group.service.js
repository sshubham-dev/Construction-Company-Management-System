// services/group.service.js

const { Group } = require("../../models/ledger.models");

// ✅
const createGroup = async (data, user) => {
  const { name, nature, parentId } = data;
  console.log(user.companyId);

  if (!name || !user.companyId || !nature) {
    throw new Error("Missing required fields");
  }

  return await Group.create({
    name,
    companyId: user.companyId,
    nature,
    parentId: parentId || null,
  });
};

// ✅
const getGroups = async (companyId) => {
  return await Group.find({ companyId })
    .sort({ name: 1 })
    .populate("companyId")
    .populate("parentId");
};

const getGroup = async (id) => {
  return await Group.findById(id)
    .populate("companyId")
    .populate("parentId")
    .exec();
};

const updateGroup = async (id, data) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      { $set: data }, // ✅ dynamic update
      {
        new: true, // return updated document
        runValidators: true, // enforce schema rules
      },
    );

    if (!updatedGroup) {
      throw new Error("Group not found");
    }

    return updatedGroup;
  } catch (error) {
    throw error;
  }
};

const deleteGroup = async (id) => {
  return await Group.findByIdAndDelete(id);
};

module.exports = { createGroup, getGroups, updateGroup, getGroup, deleteGroup };
