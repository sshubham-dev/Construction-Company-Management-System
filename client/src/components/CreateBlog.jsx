import { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const BlogEditor = () => {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    featuredImage: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft",
  });

  const saveBlog = async () => {
    if (!form.title || !form.excerpt || !form.content) {
      alert("Title, excerpt and content are required");
      return;
    }

    try {
      const res = await axios.post("/api/v1/blogs", form);
      console.log(res.data);
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };
  const previewBlog = () => {
    sessionStorage.setItem("blog-preview", JSON.stringify(form));
    window.open("http://localhost:8081/blog/preview", "_blank");
  };
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Blog Editor</h1>

      <input
        className="w-full border p-3 mb-4"
        placeholder="Title"
        value={form.title}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            title: e.target.value,
            slug: prev.slug
              ? prev.slug
              : e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, ""),
          }))
        }
      />

      <textarea
        className="w-full border p-3 mb-4"
        placeholder="Excerpt"
        rows={3}
        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
      />

      <input
        className="w-full border p-3 mb-4"
        placeholder="Category (e.g. Construction)"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />

      <input
        className="w-full border p-3 mb-4"
        placeholder="Featured image URL"
        value={form.featuredImage}
        onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
      />

      <ReactQuill
        value={form.content}
        onChange={(val) => setForm({ ...form, content: val })}
        modules={{
          toolbar: [
            [{ header: [2, 3, false] }],
            ["bold", "italic"],
            [{ list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        }}
      />

      <div className="flex gap-4 mt-6">
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="border p-2"
        >
          <option value="draft">Draft</option>
          <option value="published">Publish</option>
        </select>

        <button
          onClick={saveBlog}
          className="bg-leaf text-black border-2 border-black px-6 py-2 rounded-lg"
        >
          Save
        </button>
        <button
          type="button"
          onClick={previewBlog}
          className="border px-6 py-2 rounded"
        >
          Preview
        </button>
      </div>
    </div>
  );
};

export default BlogEditor;
