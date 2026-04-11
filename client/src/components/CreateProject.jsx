import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ProjectEditor({ onClose }) {
  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    purpose: "",
    projectType: "",
    subType: "",
    theme: "",
    city: "",
    area: "",
    plotSize: "",
    builtup: "",
    floors: "",
    configuration: "",
    direction: "",
    budget: "",
    budgetType: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });
  const { id } = useParams();
  const [files, setFiles] = useState({
    coverImage: null,
    floorPlan: null,
    galleryImages: [],
    video: null,
  });

  const [preview, setPreview] = useState({
    cover: null,
    gallery: [],
  });

  /* HANDLE TEXT */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* COVER */
  const handleCover = (file) => {
    setFiles({ ...files, coverImage: file });
    setPreview({ ...preview, cover: URL.createObjectURL(file) });
  };

  /* GALLERY */
  const handleGallery = (fileList) => {
    const arr = Array.from(fileList);

    setFiles({ ...files, galleryImages: arr });

    setPreview({
      ...preview,
      gallery: arr.map((f) => URL.createObjectURL(f)),
    });
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      /* TEXT */
      Object.keys(form).forEach((key) => {
        fd.append(key, form[key]);
      });

      /* SEO */
      fd.append("seo[title]", form.seoTitle);
      fd.append("seo[description]", form.seoDescription);
      fd.append("seo[keywords]", form.seoKeywords);

      /* FILES */
      if (files.coverImage) fd.append("coverImage", files.coverImage);
      if (files.floorPlan) fd.append("floorPlan", files.floorPlan);
      if (files.video) fd.append("video", files.video);

      files.galleryImages.forEach((file) => {
        fd.append("galleryImages", file);
      });

      await axios.post("/api/v1/projects/post", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Project Created Successfully");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error creating project");
    }
  };

  return (
    <div className="mx-auto p-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="title"
            placeholder="Title"
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="shortDescription"
            placeholder="Short Description"
            onChange={handleChange}
            className="input"
          />
        </div>

        <textarea
          name="description"
          placeholder="Full Description"
          onChange={handleChange}
          className="textarea"
        />

        {/* TYPE */}
        <div className="grid md:grid-cols-3 gap-4">
          <input
            name="projectType"
            placeholder="Project Type"
            onChange={handleChange}
            className="input"
          />
          <input
            name="purpose"
            placeholder="Purpose"
            onChange={handleChange}
            className="input"
          />
          <input
            name="subType"
            placeholder="Sub Type"
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* LOCATION */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="city"
            placeholder="City"
            onChange={handleChange}
            className="input"
          />
          <input
            name="area"
            placeholder="Area"
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* SPECIFICATIONS */}
        <div className="grid md:grid-cols-3 gap-4">
          <input
            name="plotSize"
            placeholder="Plot Size"
            className="input"
            onChange={handleChange}
          />
          <input
            name="builtup"
            placeholder="Builtup Area"
            className="input"
            onChange={handleChange}
          />
          <input
            name="floors"
            placeholder="Floors"
            className="input"
            onChange={handleChange}
          />

          <input
            name="configuration"
            placeholder="Configuration"
            className="input"
            onChange={handleChange}
          />
          <input
            name="direction"
            placeholder="Direction"
            className="input"
            onChange={handleChange}
          />
          <input
            name="theme"
            placeholder="Theme"
            className="input"
            onChange={handleChange}
          />
        </div>

        {/* BUDGET */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="budget"
            placeholder="Budget"
            className="input"
            onChange={handleChange}
          />
          <input
            name="budgetType"
            placeholder="Budget Type"
            className="input"
            onChange={handleChange}
          />
        </div>

        {/* MEDIA */}
        <div className="border p-4 rounded space-y-4 bg-gray-50">
          {/* COVER */}
          <div>
            <label>Cover Image</label>
            <input
              type="file"
              onChange={(e) => handleCover(e.target.files[0])}
              className="w-full"
            />
            {preview.cover && (
              <img src={preview.cover} className="h-32 mt-2 rounded" />
            )}
          </div>

          {/* FLOOR PLAN */}
          <div>
            <label>Floor Plan (PDF)</label>
            <input
              type="file"
              onChange={(e) =>
                setFiles({ ...files, floorPlan: e.target.files[0] })
              }
              className="w-full"
            />
          </div>

          {/* GALLERY */}
          <div>
            <label>Gallery</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleGallery(e.target.files)}
              className="w-full"
            />

            <div className="flex flex-wrap gap-2 mt-3">
              {preview.gallery.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="h-20 w-20 object-cover rounded"
                />
              ))}
            </div>
          </div>

          {/* VIDEO */}
          <div>
            <label>Video</label>
            <input
              type="file"
              onChange={(e) => setFiles({ ...files, video: e.target.files[0] })}
              className="w-full"
            />
          </div>
        </div>

        {/* SEO */}
        <div className="border p-4 rounded space-y-2">
          <input
            placeholder="SEO Title"
            className="input"
            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
          />
          <input
            placeholder="SEO Description"
            className="input"
            onChange={(e) =>
              setForm({ ...form, seoDescription: e.target.value })
            }
          />
          <input
            placeholder="Keywords (comma separated)"
            className="input"
            onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
          />
        </div>

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
          Publish Project
        </button>
      </form>
    </div>
  );
}
