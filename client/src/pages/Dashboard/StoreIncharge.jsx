import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DashboardSection from '../../components/UI/DashboardSection';
import Layout from './Layout';


const StoreIncharge = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>

    </Layout>
  );
}

export default StoreIncharge