const { createPurchase, updatePurchase, getPurchases, getPurchaseById, deletePurchase, postPurchase, cancelPurchase } = require("../services/Inventory/purchase.service");

const {
  successResponse,
  errorResponse,
} = require("../utils/responseHandler");

/**
 * Create Purchase Invoice (Draft)
 */
exports.createPurchase = async (req, res) => {
  try {
    const purchase = await createPurchase(req.body, req.user);

    return successResponse(
      res,
      purchase,
      "Purchase invoice created successfully."
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

/**
 * Update Purchase Invoice
 */
exports.updatePurchase = async (req, res) => {
  try {
    const purchase = await updatePurchase(
      req.params.id,
      req.body,
      req.user
    );

    return successResponse(
      res,
      purchase,
      "Purchase invoice updated successfully."
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

/**
 * Get All Purchase Invoices
 */
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await getPurchases(req.query, req.user);

    return successResponse(
      res,
      purchases,
      "Purchase invoices fetched successfully."
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

/**
 * Get Purchase Invoice By Id
 */
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await getPurchaseById(
      req.params.id,
      req.user
    );

    return successResponse(
      res,
      purchase,
      "Purchase invoice fetched successfully."
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

/**
 * Delete Purchase Invoice
 * (Only Draft)
 */
exports.deletePurchase = async (req, res) => {
  try {
    await deletePurchase(req.params.id, req.user);

    return successResponse(
      res,
      null,
      "Purchase invoice deleted successfully."
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

/**
 * Post Purchase Invoice
 * Creates Voucher + Outstanding + Inventory
 */
exports.postPurchase = async (req, res) => {
  try {
    const purchase = await postPurchase(
      req.params.id,
      req.user
    );

    return successResponse(
      res,
      purchase,
      "Purchase invoice posted successfully."
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

/**
 * Cancel Posted Purchase
 */
exports.cancelPurchase = async (req, res) => {
  try {
    const purchase = await cancelPurchase(
      req.params.id,
      req.user
    );

    return successResponse(
      res,
      purchase,
      "Purchase invoice cancelled successfully."
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};