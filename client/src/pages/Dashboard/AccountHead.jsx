import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Layout from "./Layout";
import EmployeeAttendance from "../../components/UI/EmployeeAttendance";
import Section from "../../components/UI/Section";
import Actions from "../../components/UI/Actions";
import Schedule from "../../components/UI/Schedule";
import FinancialSummary from "./components/FinancialSummary";
import OutstandingOverview from "./components/OutstandingOverview";
axios.defaults.withCredentials = true;

const Account_Head = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>
      <EmployeeAttendance />
      <Schedule />
      <FinancialSummary />
      <OutstandingOverview />
      <Section title="H.R Action">
        <Actions role="HR" />
      </Section>
    </Layout>
  );
};

export default Account_Head;
