import axios from "axios";
import { useSelector } from "react-redux";

const { user } = useSelector((state) => state.auth);

export const getSuppliers = async () =>
  await axios.get("/api/v1/ledger", {
    params: {
      // under: "SUNDRY_CREDITORS",
      companyId: user?.companyId,
      status: "ACTIVE",
      limit: 1000,
    },
  });

export const getPurchaseLedgers = async () =>
  await axios.get("/api/v1/ledger", {
    params: {
      companyId: user?.companyId,
      // nature: "PURCHASE",
      status: "ACTIVE",
      limit: 1000,
    },
  });

export const getCostCenters = async () =>
  await axios.get("/api/v1/cost-center", {
    params: {
      companyId: user?.companyId,
      status: "ACTIVE",
      limit: 1000,
    },
  });

export const getStockItems = async () =>
  await axios.get("/api/v1/stock-item", {
    params: {
      companyId: user?.companyId,
      status: "ACTIVE",
      limit: 1000,
    },
  });