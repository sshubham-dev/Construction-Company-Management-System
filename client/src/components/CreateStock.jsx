import { useState, useEffect } from "react";
import axios from "axios";

const CreateStock = ({ editId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    purchasePrice: "",
    mrp: "",
    gstRate: 18,
    // surchargeage: {
    //   staffSalary: 0,
    //   profit: 0,
    //   expenses: 0,
    //   investment: 0,
    //   tax: 0,
    // },
  });
  const [groups, setGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workUnits, setWorkUnits] = useState([]);
  const isEdit = Boolean(editId);

  // Load Units + Groups
  useEffect(() => {
    const loadData = async () => {
      try {
        const unitRes = await axios.post("/api/v1/work-details/name", {
          title: "Unit",
        });
        setWorkUnits(unitRes.data.description);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    const fetchGroup = async () => {
      try {
        const response = await axios.get("/api/v1/stock-group");
        setGroup(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchGroup();
    loadData();
  }, []);

  // Load existing stock (Edit Mode)
  useEffect(() => {
    if (!editId) return;

    const loadStock = async () => {
      try {
        const { data } = await axios.get(`/api/v1/stock/${editId}`);

        setFormData({
          name: data.name || "",
          category: data.category || "",
          unit: data.unit || "",
          purchasePrice: data.purchasePrice || "",
          mrp: data.mrp || "",
          gstRate: data.gstRate || 18,
          // surchargeage: {
          //   staffSalary:
          //     data.surchargeage?.staffSalary || 0,
          //   profit: data.surchargeage?.profit || 0,
          //   expenses: data.surchargeage?.expenses || 0,
          //   investment: data.surchargeage?.investment || 0,
          //   tax: data.surchargeage?.tax || 0,
          // },
        });
      } catch (err) {
        console.error("Error loading stock:", err);
      }
    };

    loadStock();
  }, [editId]);

  // Form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Surcharge nested object
    if (name.startsWith("surcharge_")) {
      const key = name.replace("surcharge_", "");
      setFormData((prev) => ({
        ...prev,
        surchargeage: {
          ...prev.surchargeage,
          [key]: Number(value),
        },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };

      if (editId !== undefined) {
        const response = await axios.put(`/api/v1/stock/${editId}`, payload);
        console.log(response.data)
        onSave(response.data);
        setLoading(false);
        onClose();
      } else {
        const response = await axios.post("/api/v1/stock", payload);
        onSave(response.data);
        setLoading(false);
              onClose();
      }

    } catch (err) {
      console.error("Error saving stock:", err);
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            className="border rounded p-2 w-full"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          >
            <option value="">Stock Group</option>
            {groups.map((group, index) => (
              <option key={index} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium">Unit</label>
          <select
            name="unit"
            className="border rounded p-2 w-full"
            value={formData.unit}
            onChange={handleChange}
          >
            <option value="">Select Unit</option>
            {workUnits.map((u, i) => (
              <option key={i} value={u.work}>
                {u.work}
              </option>
            ))}
          </select>
        </div>

        {/* Purchase Price */}
        <div>
          <label className="block text-sm font-medium">Purchase Price</label>
          <input
            type="number"
            name="purchasePrice"
            className="border rounded p-2 w-full"
            value={formData.purchasePrice}
            onChange={handleChange}
            min="0"
            step="any"
          />
        </div>

        {/* MRP */}
        <div>
          <label className="block text-sm font-medium">MRP</label>
          <input
            type="number"
            name="mrp"
            className="border rounded p-2 w-full"
            value={formData.mrp}
            onChange={handleChange}
            min="0"
            step="any"
          />
        </div>

        {/* GST */}
        <div>
          <label className="block text-sm font-medium">GST Rate (%)</label>
          <input
            type="number"
            name="gstRate"
            className="border rounded p-2 w-full"
            value={formData.gstRate}
            onChange={handleChange}
          />
        </div>

        {/* Surcharge */}
        {/* <div>
          <label className="font-medium text-sm">Surcharge (%)</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.keys(formData.surchargeage).map((key, index) => (
              <div key={index} className="flex flex-col mb-2">
                <label className="font-medium text-sm">{`${key.toUpperCase()} (%)`}</label>
                <input
                  key={key}
                  type="number"
                  name={`surcharge_${key}`}
                  placeholder={key}
                  className="border rounded p-2"
                  value={formData.surchargeage[key]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        </div> */}

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStock;
