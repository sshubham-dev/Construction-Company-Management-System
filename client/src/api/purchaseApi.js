import axios from "axios";

/**
 * Get Purchase List
 */
export const getPurchases = (params = {}) => {
  return axios.get("/api/v1/purchase-invoice", {
    params,
  });
};

/**
 * Get Purchase Details
 */
export const getPurchase = (id) => {
  return axios.get(`/api/v1/purchase-invoice/${id}`);
};

/**
 * Create Purchase
 */
export const createPurchase = (data) => {
  return axios.post("/api/v1/purchase-invoice", data);
};

/**
 * Update Purchase
 */
export const updatePurchase = (id, data) => {
  return axios.put(`/api/v1/purchase-invoice/${id}`, data);
};

/**
 * Delete Purchase
 */
export const deletePurchase = (id) => {
  return axios.delete(`/api/v1/purchase-invoice/${id}`);
};

/**
 * Post Purchase
 */
export const postPurchase = (id) => {
  return axios.post(`/api/v1/purchase-invoice/${id}/post`);
};

/**
 * Cancel Purchase
 */
export const cancelPurchase = (id) => {
  return axios.post(`/api/v1/purchase-invoice/${id}/cancel`);
};