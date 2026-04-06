import { useState } from "react";
import axios from "axios";

const ProjectEditor = ({ onClose, editId }) => {
  const [formData, setFormData] = useState({
    title: "",
    projectType: "Design",
    description: "",
    purpose: "",
    coverImage: "",
    galleryImages: [],
    documentUrl: "",
    youtubeUrl: "",
    budget: "",
    plotSize: "",
    direction: "",
    numberOfFloors: "",
    designRateList: "",
    area: "",
    theme: "",
    interiorRateList: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Dummy function representing Cloudinary upload
  const handleImageUpload = async (e) => {
    // Here you would upload the file to Cloudinary and get the URL back.
    // Example: setFormData({...formData, coverImage: cloudinary_secure_url})
    alert("Implement Cloudinary upload here, then save URL to state!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send to your Node Backend
      await axios.post("/api/v1/projects/add", formData);
      alert("Project Published to Website successfully!");
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto p-1 ">

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* COMMON FIELDS */}
        <select
          name="projectType"
          value={formData.projectType}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option value="Design">Design</option>
          <option value="Completed Construction">Completed Construction</option>
          <option value="Ongoing Construction">Ongoing Construction</option>
          <option value="Upcoming Construction">Upcoming Construction</option>
          <option value="Interior">Interior</option>
        </select>

        <input
          type="text"
          name="title"
          placeholder="Project Title / Cover Page"
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <textarea
          name="description"
          placeholder="Full Description..."
          onChange={handleChange}
          className="w-full border p-2 h-32"
          required
        />
        <input
          type="text"
          name="youtubeUrl"
          placeholder="YouTube Video Link"
          onChange={handleChange}
          className="w-full border p-2"
        />
        <input
          type="text"
          name="budget"
          placeholder="Estimated Budget"
          onChange={handleChange}
          className="w-full border p-2"
        />
        <input
          type="text"
          name="purpose"
          placeholder="Purpose (e.g., Residential)"
          onChange={handleChange}
          className="w-full border p-2"
        />

        {/* DYNAMIC FIELDS: Shows based on category selection */}
        {[
          "Design",
          "Completed Construction",
          "Ongoing Construction",
          "Upcoming Construction",
        ].includes(formData.projectType) && (
          <div className="grid grid-cols-2 gap-4 border p-4 bg-gray-50">
            <h3 className="col-span-2 font-semibold">
              Architectural/Construction Details
            </h3>
            <input
              type="text"
              name="plotSize"
              placeholder="Plot Size"
              onChange={handleChange}
              className="border p-2"
            />
            <input
              type="text"
              name="direction"
              placeholder="Direction (e.g., North)"
              onChange={handleChange}
              className="border p-2"
            />
            <input
              type="number"
              name="numberOfFloors"
              placeholder="No. of Floors"
              onChange={handleChange}
              className="border p-2"
            />
            <input
              type="text"
              name="designRateList"
              placeholder="Design Rate List link/text"
              onChange={handleChange}
              className="border p-2"
            />
          </div>
        )}

        {formData.projectType === "Interior" && (
          <div className="grid grid-cols-2 gap-4 border p-4 bg-gray-50">
            <h3 className="col-span-2 font-semibold">Interior Details</h3>
            <input
              type="text"
              name="area"
              placeholder="Area (sq ft)"
              onChange={handleChange}
              className="border p-2"
            />
            <input
              type="text"
              name="theme"
              placeholder="Theme (e.g. Modern)"
              onChange={handleChange}
              className="border p-2"
            />
            <input
              type="text"
              name="interiorRateList"
              placeholder="Interior Rate List link/text"
              onChange={handleChange}
              className="border p-2"
            />
          </div>
        )}

        {/* FILE UPLOADS */}
        <div className="border p-4 space-y-2">
          <label>Cover Image:</label>
          <input type="file" onChange={handleImageUpload} className="w-full" />
          <label>PDF / CAD Document:</label>
          <input type="file" onChange={handleImageUpload} className="w-full" />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded font-bold w-full"
        >
          Publish to Website
        </button>
      </form>
    </div>
  );
};

export default ProjectEditor;
