import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import DashboardSection from '../../components/UI/DashboardSection';
import Layout from './Layout';
import { fetchSiteByUser } from '../../features/site/siteSlice';
import ProjectProgress from '../../components/UI/ProjectProgress';
import Schedule from '../../components/UI/Schedule';
import OutstandingOverview from "./components/OutstandingOverview";
axios.defaults.withCredentials = true;

const SiteIncharge = () => {
  const [selectedSite, setSelectedSite] = useState();
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch()

  return (
    <Layout>
      <ProjectProgress/>
      <Schedule />

    </Layout>
  )
}

export default SiteIncharge