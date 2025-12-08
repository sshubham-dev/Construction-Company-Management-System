import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";

const CreateLabourAttendance = ({ onClose, id }) => {
  const [sites, setSites] = useState([]);
  const [contractors, setContractors] = useState([]);

  const [selectedSite, setSelectedSite] = useState("");
  const [selectedContractor, setSelectedContractor] = useState("");

  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    skilledMale: 0,
    skilledFemale: 0,
    unskilledMale: 0,
    unskilledFemale: 0,
    skilledMaleRate: 0,
    skilledFemaleRate: 0,
    unskilledMaleRate: 0,
    unskilledFemaleRate: 0,
    work: "",
  });

  const [loading, setLoading] = useState(false);

  /* ------------------------ Load Sites ------------------------ */
  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await axios.get("/api/v1/site");

        if (
          user?.department === "Site Incharge" ||
          user?.department === "Site Supervisor"
        ) {
          const filtered = res.data.filter((s) =>
            user.site?.some((us) => us.id === s._id)
          );
          setSites(filtered);
        } else {
          setSites(res.data);
        }
      } catch (err) {
        toast.error("Failed to load sites");
      }
    };

    loadSites();
  }, []);

  /* ------------------------ Load Contractors When Site Changes ------------------------ */
  useEffect(() => {
    if (!selectedSite) return;

    const loadContractors = async () => {
      try {
        const siteRes = await axios.get(`/api/v1/site/${selectedSite}`);
        const contractorIds = siteRes.data.contractor?.map((c) => c.id) || [];

        const allContractors = (await axios.get("/api/v1/contractor")).data;

        setContractors(allContractors.filter((c) => contractorIds.includes(c._id)));
      } catch (err) {
        toast.error("Failed to load contractors");
      }
    };

    loadContractors();
  }, [selectedSite]);

  /* ------------------------ Load Data For Edit ------------------------ */
  useEffect(() => {
    if (id) fetchData(id);
  }, [id]);

  const fetchData = async (attendanceId) => {
    try {
      const { data } = await axios.get(`/api/v1/labour-attendance/${attendanceId}`);

      // populate form
      setForm({
        skilledMale: data.skilledMale,
        skilledFemale: data.skilledFemale,
        unskilledMale: data.unskilledMale,
        unskilledFemale: data.unskilledFemale,
        skilledMaleRate: data.skilledMaleRate || 0,
        skilledFemaleRate: data.skilledFemaleRate || 0,
        unskilledMaleRate: data.unskilledMaleRate || 0,
        unskilledFemaleRate: data.unskilledFemaleRate || 0,
        work: data.work,
      });

      setSelectedSite(data.site.id);

      // if contractorId exists → normal contractor  
      // if no contractorId and contractor === "Supply Labour" → supply
      if (data.contractorId) {
        setSelectedContractor(data.contractorId);
      } else {
        setSelectedContractor("Supply Labour");
      }

    } catch (err) {
      toast.error("Could not load attendance");
    }
  };

  /* ------------------------ Handle Input ------------------------ */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* --------------------------- Submit --------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSite) return toast.error("Select site");
    if (!selectedContractor) return toast.error("Select contractor");

    try {
      setLoading(true);

      const payload = {
        site: selectedSite,
        contractor: selectedContractor,
        ...form,
      };

      if (id) {
        // EDIT MODE
        await axios.put(`/api/v1/labour-attendance/${id}`, payload);
        toast.success("Attendance updated successfully");
      } else {
        // CREATE MODE
        await axios.post("/api/v1/labour-attendance", payload);
        toast.success("Attendance saved successfully");

        // reset form only on create
        setForm({
          skilledMale: 0,
          skilledFemale: 0,
          unskilledMale: 0,
          unskilledFemale: 0,
          skilledMaleRate: 0,
          skilledFemaleRate: 0,
          unskilledMaleRate: 0,
          unskilledFemaleRate: 0,
          work: "",
        });
      }

      onClose();
    } catch (err) {
      toast.error("Failed to submit attendance");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- UI --------------------------- */
  return (
    <div className="mx-auto mt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* SITE */}
        <div>
          <label className="text-sm font-medium text-gray-700">Site</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedSite}
            onChange={(e) => {
              setSelectedSite(e.target.value);
              setSelectedContractor("");
            }}
            disabled={!!id} // disable on edit
          >
            <option value="">Select Site</option>
            {sites.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* CONTRACTOR */}
        <div>
          <label className="text-sm font-medium text-gray-700">Contractor</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedContractor}
            onChange={(e) => setSelectedContractor(e.target.value)}
            disabled={!selectedSite || !!id} // disable in edit mode
          >
            <option value="">Select Contractor</option>

            {contractors.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}

            <option value="Supply Labour">Supply Labour</option>
          </select>
        </div>

        {/* LABOUR INPUT GRID */}
        <div className="grid grid-cols-2 gap-4">
          {[
            ["skilledMale", "skilledMaleRate"],
            ["skilledFemale", "skilledFemaleRate"],
            ["unskilledMale", "unskilledMaleRate"],
            ["unskilledFemale", "unskilledFemaleRate"],
          ].map(([qtyField, rateField]) => (
            <div key={qtyField} className="border p-3 rounded-lg">
              
              <label className="text-sm font-semibold capitalize">
                {qtyField.replace(/([A-Z])/g, " $1")}:
              </label>

              <input
                type="number"
                name={qtyField}
                value={form[qtyField]}
                onChange={handleChange}
                className="w-full mt-1 mb-2 border p-2 rounded"
                min="0"
              />

              {selectedContractor === "Supply Labour" && (
                <label className="text-sm font-semibold capitalize mt-2">
                  Rate: 
                <input
                  type="number"
                  name={rateField}
                  value={form[rateField]}
                  onChange={handleChange}
                  className="w-full  border p-2 rounded"
                  placeholder="Rate"
                  min="0"
                  />
                  </label>
              )}
            </div>
          ))}
        </div>

        {/* WORK DETAIL */}
        <div>
          <label className="text-sm font-medium text-gray-700">Work Detail</label>
          <textarea
            name="work"
            value={form.work}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : id ? "Update Attendance" : "Save Attendance"}
        </button>
      </form>

      <Toaster position="top-right" />
    </div>
  );
};

export default CreateLabourAttendance;
