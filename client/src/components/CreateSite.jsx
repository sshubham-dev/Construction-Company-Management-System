import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";

axios.defaults.withCredentials = true;

const CreateSite = ({ onClose, isEdit }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [siteIdToEdit, setSiteIdToEdit] = useState(null);
  const [site, setSite] = useState({
    name: "",
    client: "",
    structureType: "",
    projectType: "",
    incharge: "",
    supervisor: "",
    qualityEngineer: "",
    address: "",
    floors: [
      {
        name: "",
        unit: "SQFT",
        area: 0,
        dim: { l: 0, w: 0, h: 0 },
      },
    ],
  });

  const [data, setData] = useState({});
  const [clients, setClients] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [qualityEngineers, setQualityEngineers] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const projectType = [
    "Residential",
    "Commercial",
    "Institutional",
    "Government",
  ];
  const unitOptions = ["SQFT", "SQMT", "RFT", "CUM", "NOS", "LUMSUM", "CFT"];

  // Fetch dropdown data + site details if editing
  useEffect(() => {
    if (isEdit) {
      setSiteIdToEdit(isEdit);
      fetchSiteDetails(isEdit);
    }

    const fetchData = async () => {
      try {
        const [usersRes, clientsRes] = await Promise.all([
          axios.get("/api/v1/user/lists"),
          axios.get("/api/v1/client"),
        ]);

        const users = usersRes.data;
        setClients(clientsRes.data);
        setIncharges(users.filter((u) => u.department === "Site Incharge"));
        setSupervisors(users.filter((u) => u.department === "Site Supervisor"));
        setQualityEngineers(
          users.filter((u) => u.department === "Quality Engineer")
        );
      } catch (error) {
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, [isEdit]);

  const fetchSiteDetails = async (id) => {
    try {
      const response = await axios.get(`/api/v1/site/${id}`);
      const s = response.data;
      console.log(s)

      setData({
        client: s.client?.name,
        incharge: s.incharge?.name,
        supervisor: s.supervisor?.name,
        qualityEngineer: s.qualityEngineer?.name,
      });

      setSite({
        name: s.name,
        client: s.client?.id,
        structureType: s.structureType,
        projectType: s.projectType,
        incharge: s.incharge?.id,
        supervisor: s.supervisor?.id,
        qualityEngineer: s.qualityEngineer?.id,
        address: s.address,
        floors: s.floors,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSite((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------------------------------------------
  // SIMPLE DIMENSION-BASED AREA CALCULATION
  // ---------------------------------------------------------
  // const handleFloorChange = (index, field, value) => {
  //   const updated = [...site.floors];

  //   // Update nested dimension fields like dim.l, dim.w, dim.h
  //   if (field.startsWith("dim.")) {
  //     const key = field.split(".")[1];
  //     updated[index].dim[key] = Number(value);
  //   } else {
  //     updated[index][field] = value;
  //   }

  //   // Auto-calc area: multiply only available non-zero dimensions
  //   const { l, w, h } = updated[index].dim || {};
  //   const dims = [l, w, h].filter((d) => Number(d) > 0);

  //   if (dims.length > 0) {
  //     updated[index].area = dims.reduce((acc, num) => acc * num, 1);
  //   }

  //   setSite((prev) => ({ ...prev, floors: updated }));
  // };

const handleFloorChange = (index, field, value) => {
  const updated = [...site.floors];

  // Ensure the floor has dim object
  if (!updated[index].dim) {
    updated[index].dim = { l: 0, w: 0, h: 0 };
  }

  if (field.startsWith("dim.")) {
    const key = field.split(".")[1];
    updated[index].dim[key] = Number(value);
  } else {
    updated[index][field] = value;
  }

  const { l, w, h } = updated[index].dim;
  const dims = [l, w, h].filter((d) => Number(d) > 0);

  if (dims.length > 0) {
    updated[index].area = dims.reduce((acc, num) => acc * num, 1);
  }

  setSite((prev) => ({ ...prev, floors: updated }));
};



  // ---------------------------------------------------------

  const addNewFloor = () => {
    setSite((prev) => ({
      ...prev,
      floors: [
        ...prev.floors,
        { name: "", unit: "SQFT", area: 0, dim: { l: 0, w: 0, h: 0 } },
      ],
    }));
  };

  const removeFloor = (index) => {
    const updated = [...site.floors];
    updated.splice(index, 1);
    setSite((prev) => ({ ...prev, floors: updated }));
  };

  // Generate floors based on structureType
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const generateFloorsFromStructure = (str) => {
    const s = str.toUpperCase().replace(/\s+/g, "");
    const floors = [];
    const above = ["Ground", "First", "Second", "Third", "Fourth", "Fifth"];

    const basementMatch = s.match(/(\d*)B/);
    const basementCount = basementMatch ? parseInt(basementMatch[1] || 1) : 0;

    for (let i = basementCount; i >= 1; i--) {
      floors.push({
        name: `Basement ${basementCount > 1 ? i : ""}`.trim(),
        area: 0,
        unit: "SQFT",
      });
    }

    if (s.includes("G")) floors.push({ name: "Ground", area: 0, unit: "SQFT" });
    if (s.includes("MZ"))
      floors.push({ name: "Mazanine", area: 0, unit: "SQFT" });

    const plusMatch = s.match(/\+(\d+)/);
    if (plusMatch) {
      const count = parseInt(plusMatch[1]);
      for (let i = 1; i <= count; i++) {
        const label = above[i] || `Floor ${i}`;
        floors.push({
          name: label,
          area: 0,
          unit: "SQFT",
          dim: { l: 0, w: 0, h: 0 },
        });
      }
    }

    if (/^(FIRST|SECOND|THIRD|FOURTH|GROUND)$/.test(s)) {
      floors.push({
        name: capitalize(s.toLowerCase()),
        area: 0,
        unit: "SQFT",
        dim: { l: 0, w: 0, h: 0 },
      });
    }

    return floors;
  };

  const handleNext = () => {
    if (!site.name || !site.client || !site.structureType) {
      toast.error("Please fill basic details first");
      return;
    }

    if (!isEdit || !site.floors || site.floors.length === 0) {
      const autoFloors = generateFloorsFromStructure(site.structureType);
      setSite((prev) => ({
        ...prev,
        floors: [
          { name: "Parking", area: 0, unit: "SQFT" },
          ...autoFloors,
          { name: "Headroom", area: 0, unit: "SQFT" },
          { name: "Parapet", area: 0, unit: "SQFT", dim: { l: 0, w: 0, h: 0 } },
        ],
      }));
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(site).forEach(([key, value]) => {
        if (key === "floors") formData.append(key, JSON.stringify(value));
        else formData.append(key, value);
      });

      if (siteIdToEdit) {
        await axios.put(`/api/v1/site/${siteIdToEdit}`, formData);
        toast.success("Site updated successfully");
      } else {
        await axios.post("/api/v1/site", formData);
        toast.success("Site created successfully");
        dispatch(fetchNotifications(user._id));
      }

      onClose();
    } catch (error) {
      console.log(error)
      toast.error(error.message || "Error submitting site");
    } finally {
      setLoading(false);
    }
  };

  // UI: BASIC DETAILS
  const renderBasicDetails = () => (
    <>
      <div className="space-y-4 bg-white rounded-xl">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Site Name
          </label>
          <input
            type="text"
            name="name"
            value={site.name}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg w-full p-2.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Client
          </label>
          <select
            name="client"
            value={site.client}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg w-full p-2.5"
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Structure Type
          </label>
          <input
            type="text"
            name="structureType"
            value={site.structureType}
            onChange={handleChange}
            placeholder="e.g. G+1, B+G+2"
            className="border border-gray-300 rounded-lg w-full p-2.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Project Type
          </label>
          <select
            name="projectType"
            value={site.projectType}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg w-full p-2.5"
          >
            <option value="">Select Project Type</option>
            {projectType.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Quality Engineer
          </label>
          <select
            name="qualityEngineer"
            value={site.qualityEngineer}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg w-full p-2.5"
          >
            <option value="">Select Quality Engineer</option>
            {qualityEngineers.map((q) => (
              <option key={q._id} value={q._id}>
                {q.userName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Site Incharge
          </label>
          <select
            name="incharge"
            value={site.incharge}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg w-full p-2.5"
          >
            <option value="">Select Site Incharge</option>
            {incharges.map((i) => (
              <option key={i._id} value={i._id}>
                {i.userName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Site Supervisor
          </label>
          <select
            name="supervisor"
            value={site.supervisor}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg w-full p-2.5"
          >
            <option value="">Select Site Supervisor</option>
            {supervisors.map((s) => (
              <option key={s._id} value={s._id}>
                {s.userName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={site.address}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg w-full p-2.5"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleNext}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg"
        >
          Next →
        </button>
      </div>
    </>
  );

  // UI: FLOOR DETAILS
  const renderFloorDetails = () => (
    <>
      <h3 className="text-xl font-semibold mb-5">Floor Details</h3>

      <div className="space-y-4">
        {site.floors.map((floor, index) => (
          <div key={index} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex justify-between mb-3">
              <h4 className="text-lg font-medium">
                {floor.name || `Floor ${index + 1}`}
              </h4>

              <button
                type="button"
                onClick={() => removeFloor(index)}
                className="text-red-500 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Floor Name</label>
                <input
                  type="text"
                  value={floor.name}
                  onChange={(e) =>
                    handleFloorChange(index, "name", e.target.value)
                  }
                  className="border rounded-lg w-full p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Area</label>
                <input
                  type="number"
                  value={floor.area}
                  onChange={(e) =>
                    handleFloorChange(index, "area", e.target.value)
                  }
                  className="border rounded-lg w-full p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Unit</label>
                <select
                  value={floor.unit}
                  onChange={(e) =>
                    handleFloorChange(index, "unit", e.target.value)
                  }
                  className="border rounded-lg w-full p-2.5"
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Length
                </label>
                <input
                  type="number"
                  value={floor.dim?.l || 0}
                  onChange={(e) =>
                    handleFloorChange(index, "dim.l", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg w-full p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={floor.dim?.h || 0}
                  onChange={(e) =>
                    handleFloorChange(index, "dim.h", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg w-full p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={floor.dim?.w || 0}
                  onChange={(e) =>
                    handleFloorChange(index, "dim.w", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg w-full p-2.5"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={addNewFloor}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add More Floor
        </button>

        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="bg-gray-300 px-4 py-2 rounded-lg"
          >
            ← Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-green-400" : "bg-green-600"
            } text-white px-5 py-2 rounded-lg`}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {step === 1 ? renderBasicDetails() : renderFloorDetails()}
      </form>
      <Toaster position="top-right" />
    </div>
  );
};

export default CreateSite;
