const { createPurchase, updatePurchase, getPurchases, getPurchaseById, deletePurchase, postPurchase, cancelPurchase } = require("../services/Inventory/purchase.service");

const {
  successResponse,
  errorResponse,
} = require("../utils/responseHandler");

/**
 * Create Purchase Invoice (Draft)
 */
exports.createPurchaseInvoice = async (req, res) => {
  try {
    const purchase = await createPurchase(req.body, req.user);

    return successResponse(
      res,
      purchase,
      "Purchase invoice created successfully."
    );
  } catch (error) {
    console.log(error)
    return errorResponse(res, error);
  }
};

/**
 * Update Purchase Invoice
 */
exports.updatePurchaseInvoice = async (req, res) => {
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
exports.getPurchasesInvoice = async (req, res) => {
  try {
    const purchases = await getPurchases(req.query, req.user);

    return successResponse(
      res,
      purchases,
      "Purchase invoices fetched successfully."
    );
  } catch (error) {
    console.log(error)
    return errorResponse(res, error);
  }
};

/**
 * Get Purchase Invoice By Id
 */
exports.getPurchaseByIdInvoice = async (req, res) => {
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
    console.log(error)
    return errorResponse(res, error);
  }
};

/**
 * Delete Purchase Invoice
 * (Only Draft)
 */
exports.deletePurchaseInvoice = async (req, res) => {
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
exports.postPurchaseInvoice = async (req, res) => {
  try {
    const purchase = await postPurchase(
      req.params.id,
      req.user._id
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
exports.cancelPurchaseInvoice = async (req, res) => {
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