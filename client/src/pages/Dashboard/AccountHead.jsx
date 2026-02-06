import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Layout from "./Layout";
import EmployeeAttendance from "../../components/UI/EmployeeAttendance";
import Section from "../../components/UI/Section";
import Actions from "../../components/UI/Actions";
import Schedule from "../../components/UI/Schedule";
axios.defaults.withCredentials = true;

const Account_Head = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>
      <EmployeeAttendance />
      <Schedule />
      <Section title="H.R Action">
        <Actions role="HR" />
      </Section>
    </Layout>
  );
};

export default Account_Head;
