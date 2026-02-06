import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Layout from "./Layout";
import EmployeeAttendance from "../../components/UI/EmployeeAttendance";
import { FiUsers, FiChevronRight, FiX } from "react-icons/fi";

axios.defaults.withCredentials = true;


const Marketing = () => {
  const { user } = useSelector((state) => state.auth);
 
  return (
    <Layout>
      <EmployeeAttendance />
    </Layout>
  );
};

export default Marketing;
