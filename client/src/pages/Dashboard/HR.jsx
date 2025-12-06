import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DashboardSection from '../../components/UI/DashboardSection';
import Layout from './Layout';
import {
  FiUsers,
  FiChevronRight,
  FiX
} from "react-icons/fi";
import ProgressBar from "../../components/UI/ProgressBar";
import EmployeeAttendance from '../../components/UI/EmployeeAttendance';

const HR = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>
<EmployeeAttendance/>
    </Layout>
  );
}

export default HR