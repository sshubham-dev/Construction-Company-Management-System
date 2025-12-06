import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";


axios.defaults.withCredentials = true;
export default function ProjectProgress() {
  const [projects, setProjects] = useState([]);
  const [showAll, setShowAll] = useState(false);
    const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const { data } = await axios.get("/api/v1/site");

        let filteredSites = [];

        // Filter for Incharge / Supervisor
        if (user.department === "Site Supervisor" || user.department === "Site Incharge") {
          const existingSites = user?.site || []; // array of sites assigned to this user
          filteredSites = data.filter((site) =>
            existingSites.some((existingSite) => existingSite.id === site._id)
          );
          // console.log(filteredSites)
        } else {
          // CEO / Others → all sites
          filteredSites = data;
        }

        // Map into project progress data
        const progressData = filteredSites.map((site) => {
          const totalAmount = site?.accountSummary?.totalIncome || site.totalAmount || 0;
          const receivedAmount = site.totalReceived || 0;

          const progress = totalAmount
            ? Math.round((receivedAmount / totalAmount) * 100)
            : 0;

          return {
            name: site.name,
            progress,
            balance: totalAmount - receivedAmount,
          };
        });

        setProjects(progressData);
      } catch (err) {
        console.error("Error fetching sites:", err);
      }
    };

    fetchSites();
  }, [user]);

  const getProgressBarStyle = (progress) => ({
    width: `${progress}%`,
    backgroundColor:
      progress < 50 ? "red" : progress < 80 ? "yellow" : "limegreen",
  });

  // Show 3–5 sites first, rest hidden
  const visibleProjects = showAll ? projects : projects.slice(0, 5);

  return (
    <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg">
      <h2 className="font-bold text-lg mb-4 text-gray-700">Project Progress</h2>

      {visibleProjects.map((p, i) => (
        <div key={i} className="mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>{p.name}</span>
            <span>{p.progress}%</span>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            Balance: {p.balance.toLocaleString()}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-2"
              style={getProgressBarStyle(p.progress)}
            ></div>
          </div>
        </div>
      ))}

      {projects.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}
