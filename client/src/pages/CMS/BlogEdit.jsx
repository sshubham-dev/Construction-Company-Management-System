import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";

const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
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

  /* LOAD BLOG */
  useEffect(() => {
    const loadBlog = async () => {
      try {
        const { data } = await axios.get(`/api/v1/blogs/${id}`);
        setForm({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category || "",
          featuredImage: data.featuredImage || "",
          seoTitle: data.seoTitle || "",
          seoDescription: data.seoDescription || "",
          status: data.status,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load blog");
      }
    };

    loadBlog();
  }, [id]);

  /* UPDATE */
  const updateBlog = async () => {
    if (!form.title || !form.excerpt || !form.content) {
      alert("Title, excerpt and content are required");
      return;
    }

    try {
      await axios.put(`/api/v1/blogs/${id}`, form);
      alert("Blog updated");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const previewBlog = ({ id }) => {
    console.log(id)
    navigate(`http://localhost:8081/blog/preview/${id}`);
  };

  /* DELETE */
  const deleteBlog = async () => {
    if (!window.confirm("Delete this blog permanently?")) return;

    try {
      await axios.delete(`/api/v1/blogs/${id}`);
      navigate("/admin/blogs");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Blog</h1>
        <button onClick={deleteBlog} className="text-red-600 text-sm">
          Delete
        </button>
      </div>

      <input
        className="w-full border p-3 mb-4 text-xl"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <input
        className="w-full border p-3 mb-4"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
      />

      <textarea
        className="w-full border p-3 mb-4"
        rows={3}
        value={form.excerpt}
        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
      />

      <input
        className="w-full border p-3 mb-4"
        placeholder="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />

      <input
        className="w-full border p-3 mb-6"
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

      <div className="bg-offwhite border rounded p-4 mt-6">
        <h3 className="font-semibold mb-3">SEO</h3>

        <input
          className="w-full border p-2 mb-3"
          placeholder="SEO title"
          value={form.seoTitle}
          onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
        />

        <textarea
          className="w-full border p-2"
          rows={3}
          placeholder="SEO description"
          value={form.seoDescription}
          onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
        />
      </div>

      <div className="flex gap-4 mt-6">
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="border p-2"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <button
          onClick={updateBlog}
          className="bg-leaf text-white px-6 py-2 rounded"
        >
          Update Blog
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

export default BlogEdit;
