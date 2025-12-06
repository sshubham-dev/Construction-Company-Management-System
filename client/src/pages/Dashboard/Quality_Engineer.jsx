import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DashboardSection from '../../components/UI/DashboardSection';
import Layout from './Layout';
import Schedule from '../../components/UI/Schedule';


const Quality_Engineer = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>
      <Schedule/>
    </Layout>
  );
}

export default Quality_Engineer