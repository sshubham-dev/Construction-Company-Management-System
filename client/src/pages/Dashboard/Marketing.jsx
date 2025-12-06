import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import DashboardSection from "../../components/UI/DashboardSection";
import Layout from "./Layout";
import Section from "../../components/UI/Section";
import Actions from "../../components/UI/Actions";
import { FiUsers, FiChevronRight, FiX } from "react-icons/fi";
import Schedule from "../../components/UI/Schedule"

import ProgressBar from "../../components/UI/ProgressBar";
import EmployeeAttendance from "../../components/UI/EmployeeAttendance";

const Marketing = () => {
  const { user } = useSelector((state) => state.auth);
 
  return (
    <Layout>
      <EmployeeAttendance/>
      <Schedule/>
      <Section title="H.R Action">
        <Actions role="HR" />
      </Section>
    </Layout>
  );
};

export default Marketing;
