const StoreInventory = require("../models/storeInventory.models");

const getStoreInventory = async (req, res) => {
  try {
    const { storeId } = req.params;

    const inventory = await StoreInventory.find({ storeId })
      .populate("stockId", "name unit category")
      .sort({ "stockId.name": 1 });

    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStoreStock = async (req, res) => {
  try {
    const { storeId, stockId } = req.params;

    const item = await StoreInventory.findOne({
      storeId,
      stockId,
    }).populate("stockId");

    if (!item) {
      return res.status(404).json({ message: "Stock not found in store" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const increaseStoreStock = async ({
  storeId,
  stockId,
  quantity,
  rate,
}) => {
  let inventory = await StoreInventory.findOne({ storeId, stockId });

  if (!inventory) {
    inventory = new StoreInventory({
      storeId,
      stockId,
      quantity: 0,
      averageRate: 0,
      stockValue: 0,
    });
  }

  const oldQty = inventory.quantity;
  const oldValue = inventory.stockValue;

  const addedValue = quantity * rate;
  const newQty = oldQty + quantity;
  const newValue = oldValue + addedValue;

  inventory.quantity = newQty;
  inventory.averageRate = newQty > 0 ? newValue / newQty : 0;
  inventory.stockValue = newValue;
  inventory.lastMovementAt = new Date();

  await inventory.save();

  return inventory;
};


const decreaseStoreStock = async ({
  storeId,
  stockId,
  quantity,
}) => {
  const inventory = await StoreInventory.findOne({ storeId, stockId });

  if (!inventory || inventory.quantity < quantity) {
    throw new Error("Insufficient stock");
  }

  inventory.quantity -= quantity;
  inventory.stockValue =
    inventory.quantity * inventory.averageRate;
  inventory.lastMovementAt = new Date();

  await inventory.save();

  return inventory;
};


module.exports = {
  getStoreInventory,
  getStoreStock,
    increaseStoreStock,
    decreaseStoreStock,
};