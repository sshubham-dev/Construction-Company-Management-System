import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const Housekeeping = ({ onClose }) => {
  const [checkFor, setCheckFor] = useState(""); // Site | Office | Store
  const [locationName, setLocationName] = useState("");
  const [siteId, setSiteId] = useState("");
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [checked, setChecked] = useState(new Array(tasks.length).fill(""));
  const [remarks, setRemarks] = useState(new Array(tasks.length).fill(""));
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchWorkDetails();
    if (checkFor === "Site") {
      fetchSite();
    }
  }, [checkFor !== '']);

    const fetchSite = async () => {
      try {
        const response = await axios.get("/api/v1/site");
        if (
          user.department === "Site Incharge" ||
          user.department === "Site Supervisor"
        ) {
          const existingSites = user?.site;
          let SitesData = [];
          for (let site of response.data) {
            if (
              existingSites?.some(
                (existingSite) => existingSite.id === site._id
              )
            ) {
              SitesData.push(site);
            }
          }
          setSites(SitesData);
          // console.log(SitesData)
        } else {
          setSites(response.data);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

  const fetchWorkDetails = async () => {
    try {
      const title = `${checkFor} Housekeeping`;
      const response = await axios.get("/api/v1/work-details");
      const filteredItems = response.data.filter((item) =>
        item.title.toLowerCase().includes(title.toLowerCase())
      )[0];
      console.log(filteredItems?.description);
      setTasks(filteredItems?.description || []);
    } catch (error) {
      console.error("Error fetching work details:", error);
    }
  };

  const handleCheck = (index, value) => {
    const updated = [...checked];
    updated[index] = value;
    setChecked(updated);
  };

  const handleRemarkChange = (index, text) => {
    const updated = [...remarks];
    updated[index] = text;
    setRemarks(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const totalTasks = tasks.length;
    const completedTasks = checked.filter((c) => c).length;
    const points = Number(((completedTasks / totalTasks) * 10).toFixed(2));

    const payload = {
      checkFor: checkFor,
      siteId: checkFor === "Site" ? siteId : null,
      locationName: checkFor !== "Site" ? locationName : null,
      tasks: tasks.map((task, i) => ({
        task,
        completed: checked[i],
        remarks: remarks[i] || "",
      })),
      points,
    };

    try {
      const res = await axios.post("/api/v1/housekeeping", payload);
      if (onSave) onSave(res.data);
      alert("Saved successfully");
      setLoading(false);
      onClose()
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Select location type */}
      <div>
        <label className="text-sm font-medium">Check For</label>
        <select
          className="w-full border rounded p-2"
          value={checkFor}
          onChange={(e) => setCheckFor(e.target.value)}
        >
          <option value="">Select</option>
          <option value="Site">Site</option>
          <option value="Office">Office</option>
          <option value="Store">Store</option>
        </select>
      </div>

      {/* Location selector */}
      {checkFor === "Site" && (
        <div>
          <label className="text-sm font-medium">Select Site</label>
          <select
            className="w-full border rounded p-2"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
          >
            <option value="">Choose Site</option>
            {sites.map((site) => (
              <option key={site._id} value={site._id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {checkFor && checkFor !== "Site" && (
        <div>
          <label className="text-sm font-medium">Enter {checkFor} Name</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder={`Enter ${checkFor} name`}
            value={checkFor}
            onChange={(e) => setLocationName(e.target.value)}
          />
        </div>
      )}

      {/* Tasks checklist */}
      <div className="space-y-3">
        {tasks.map((task, i) => (
          <div
            key={i}
            className="flex flex-col border p-3 rounded-md bg-white shadow-sm"
          >
            {/* Task Label */}
            <span className="text-sm font-medium text-gray-800">
              {task.work}
            </span>

            {/* Select Yes / No / N/A */}
            <select
              className="mt-2 p-2 border rounded text-sm bg-gray-50 focus:outline-blue-500"
              value={checked[i]}
              onChange={(e) => handleCheck(i, e.target.value)}
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="na">N/A</option>
            </select>

            {/* Remarks */}
            <input
              type="text"
              className="mt-2 border rounded p-2 text-xs w-full bg-gray-50 focus:outline-blue-500"
              placeholder="Remarks (optional)"
              value={remarks[i]}
              onChange={(e) => handleRemarkChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !checkFor}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

export default Housekeeping;
