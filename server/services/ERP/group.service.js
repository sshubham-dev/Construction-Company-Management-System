// services/group.service.js

const { Group } = require("../../models/ledger.models");


const createGroup = async (data, user) => {
  const { name, nature, parentId } = data;
  console.log(user.companyId)

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

const getGroups = async (companyId) => {
  return await Group.find({ companyId }).sort({ name: 1 }).populate("companyId").populate("parentId");
};

const updateGroup = async (id, data) => {
  return await Group.findByIdAndUpdate(id, data);
};

module.exports = { createGroup, getGroups, updateGroup };