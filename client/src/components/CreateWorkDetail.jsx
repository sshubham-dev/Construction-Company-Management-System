import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
axios.defaults.withCredentials = true;

function WorkDetailsForm({ onClose, id, index }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workDetail, setWorkDetail] = useState({
    title: "",
    description: [{ work: "" }],
  });

  useEffect(() => {
    if (id && index !== undefined) {
      fetchDescription(id, index);
    } else if (id) {
      fetchWorkDetail(id);
    }
  }, [id, index]);

  const fetchWorkDetail = async (id) => {
    try {
      const res = await axios.get(`/api/v1/work-details/${id}`);
      // console.log(res.data);
      setWorkDetail({
        title: res.data?.title,
        description: res.data?.description?.length
          ? res.data.description
          : [{ work: "" }],
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchDescription = async (id, index) => {
    try {
      const res = await axios.get(`/api/v1/work-details/${id}`);
      const single = res.data?.description[index];
      // console.log(res.data);
      // console.log(single);
      setWorkDetail({
        title: res.data?.title,
        description: single ? [{ work: single.work }] : [{ work: "" }],
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChange = (e, idx) => {
    const { name, value } = e.target;
    if (name === "work") {
      const newDesc = [...workDetail.description];
      newDesc[idx][name] = value;
      setWorkDetail({ ...workDetail, description: newDesc });
    } else {
      setWorkDetail({ ...workDetail, [name]: value });
    }
  };

  const addWork = () => {
    setWorkDetail((prev) => ({
      ...prev,
      description: [...prev.description, { work: "" }],
    }));
  };

  const removeWork = (idx) => {
    setWorkDetail((prev) => ({
      ...prev,
      description: prev.description.filter((_, i) => i !== idx),
    }));
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      // If user uploaded Excel file
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        if (id !== undefined) {
          // Update one WorkDetail with Excel
          response = await axios.put(
            `/api/v1/work-details/${id}/imports`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
          );
        } else {
          // Import all or create new ones from Excel
          response = await axios.post(
            "/api/v1/work-details/imports",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
          );
        }

        toast.success(response.data.message);
      } else {
        // Manual form submit (no Excel)
        if (id !== undefined && index === undefined) {
          console.log(id, workDetail);
          response = await axios.put(`/api/v1/work-details/${id}`, workDetail);
        } else if (id !== undefined && index !== undefined) {
          console.log(index, workDetail);
          response = await axios.put(
            `/api/v1/work-details/${id}/${index}`,
            workDetail,
          );
        } else {
          response = await axios.post("/api/v1/work-details", workDetail);
        }
        toast.success(response.data.message);
      }

      // onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Save failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white">
      <form onSubmit={handleSave}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600">
            Work Title
          </label>
          <input
            type="text"
            name="title"
            value={workDetail.title}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Work Description</h3>
          {workDetail.description.map((item, idx) => (
            <div className="mb-2 flex items-center" key={idx}>
              <input
                type="text"
                name="work"
                value={item.work}
                onChange={(e) => handleChange(e, idx)}
                className="border p-2 rounded w-full"
                placeholder="Enter work"
              />
              {workDetail.description.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWork(idx)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addWork}
            className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
          >
            + Add More
          </button>
        </div>

        <h2 className="text-center text-gray-600 my-4">OR</h2>

        {/* Excel Import */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600">
            Import from Excel (.xlsx, .xls, .csv)
          </label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>

        {/* Single Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white w-full py-2 rounded mt-3"
        >
          {loading
            ? "Saving..."
            : id
              ? "Update Work Detail"
              : "Create Work Detail"}
        </button>
      </form>

      <Toaster position="top-right" />
    </div>
  );
}

export default WorkDetailsForm;
