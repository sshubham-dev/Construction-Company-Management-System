import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import DashboardSection from "../../components/UI/DashboardSection";
import Layout from "./Layout";
import FinancialSummary from "./components/FinancialSummary";
import OutstandingOverview from "./components/OutstandingOverview";

const Accountant = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>
      <FinancialSummary />
      <OutstandingOverview />
    </Layout>
  );
};

export default Accountant;
