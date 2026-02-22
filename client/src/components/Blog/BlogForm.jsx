import { useState } from "react";
import Editor from "./Editor";
import SeoPanel from "./SeoPanel";
import ImageUploader from "./ImageUploader";

export default function BlogForm({ initialData = {}, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    seoTitle: "",
    seoDescription: "",
    featureImage: {
      secure_url: "",
      public_id: "",
    },
    category: "architecture",
    status: "draft",
    ...initialData,
  });
  console.log("initialData", initialData)

  const [content, setContent] = useState(initialData.content || null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSubmit({ ...form, content });
  };

  return (
    <div className=" flex flex-col gap-6 p-2 ">
      <div className="bg-white p-4 rounded-xl flex flex-col items-start gap-6 ">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Write blog title..."
          className="text-xl font-semibold outline-none w-full border-b-2 border-gray-300 focus:border-gray-950 transition pb-2"
        />
        <ImageUploader form={form} setForm={setForm} />
      </div>

      <Editor value={content} onChange={setContent} />
      <SeoPanel form={form} onChange={handleChange} />
      <div className="flex flex-col w-full items-center py-2 my-2">
        <h3 className="font-semibold text-center text-lg mb-2">Publish</h3>
        <div className="flex flex-row gap-6">
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-fit border p-2"
          >
            <option value="architecture">Architecture</option>
            <option value="construction">Construction</option>
            <option value="interior">Interior</option>
          </select>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-fit border p-2 rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={handleSave}
            className="bg-black text-white px-6 py-1.5 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
