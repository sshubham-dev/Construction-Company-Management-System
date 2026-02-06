import axios from "axios";

export const generateMonthlyPerformance = (payload) =>
  axios.post("/api/v1/monthly-performance/generate", payload);

export const getMonthlyPerformances = () =>
  axios.get("/api/v1/monthly-performance");

export const getMonthlyPerformanceById = (id) =>
  axios.get(`/api/v1/monthly-performance/${id}`);

export const lockMonthlyPerformance = (id) =>
  axios.post(`/api/v1/monthly-performance/${id}/lock`);
