import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import DashboardSection from "../../components/UI/DashboardSection";
import Layout from "./Layout";
import { FolderKanban } from "lucide-react";
import Schedule from "../../components/UI/Schedule";
import ProjectProgress from "../../components/UI/ProjectProgress";

axios.defaults.withCredentials = true;

const SiteSupervisour = () => {
  const [selectedSite, setSelectedSite] = useState();
  const { user } = useSelector((state) => state.auth);
  return (
    <Layout>
      <ProjectProgress/>
      <Schedule />
    </Layout>
  );
};

export default SiteSupervisour;
