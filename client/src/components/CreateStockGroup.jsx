import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

axios.defaults.withCredentials = true;

const CreateStockGroup = ({ onClose }) => {
  const [group, setGroup] = useState({
    name: "",
    code: "",
    unit: [],
  });
  const [workDetails, setWorkDetails] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    const fetchWorkDetails = async () => {
      try {
        const title = 'Unit';
        const workData = await axios.post('/api/v1/work-details/name', { title });
        setWorkDetails(workData.data.description);
      } catch (error) {
        console.log('Error fetching work details:', error.message);
      }
    };
    fetchWorkDetails()
  }, [])

  // ✅ Fixed function to handle react-select
  const handleMultiSelect = (selected) => {
    const values = selected ? selected.map((opt) => opt.value) : [];
    setSelectedOptions(selected);
    setGroup((prev) => ({
      ...prev,
      unit: values, // Save only values inside the group state
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/stock-group', group)
      console.log("Group Data:", group);
      console.log(response)
      onClose();
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Alias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={group.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Code</label>
            <input
              type="text"
              name="code"
              value={group.code}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Under Group */}
        <div>
          <label className="block text-sm font-medium">Unit: {group.unit.join(", ")}</label>
          <Select
            options={workDetails.map((workDetail) => ({
              value: workDetail.work,
              label: workDetail.work,
            }))}
            isMulti
            value={selectedOptions}
            onChange={handleMultiSelect}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-md">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Save Group
          </button>
        </div>
      </form>
    </div>
  );
};



export default CreateStockGroup