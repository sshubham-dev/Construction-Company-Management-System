import axios from "axios";

export const getGSTConfigs = (params) =>
    axios.get("/api/v1/gst-ledger", { params });

export const getGSTConfig = (id) =>
    axios.get(`/api/v1/gst-ledger/${id}`);

export const createGSTConfig = (data) =>
    axios.post("/api/v1/gst-ledger", data);

export const updateGSTConfig = (id, data) =>
    axios.put(`/api/v1/gst-ledger/${id}`, data);

export const deleteGSTConfig = (id) =>
    axios.delete(`/api/v1/gst-ledger/${id}`);