import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DashboardSection from '../../components/UI/DashboardSection';
import Layout from './Layout';

axios.defaults.withCredentials = true;


const Account_Head = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>

    </Layout>
  );
};

export default Account_Head;


