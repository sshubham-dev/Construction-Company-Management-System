import { useEffect, useState } from "react";
import axios from "axios";

const CreateFaq = ({ onClose, editId }) => {
  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "",
    tags: "",
    serviceId: "",
    blogId: "",
    projectId: "",
    isActive: true,
  });

  const [services, setServices] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetchServices();
    fetchBlogs();
    // fetchProjects();
  }, []);

//   const fetchServices = async () => {
//     const res = await axios.get("/api/v1/service/admin");
//     setServices(res.data.data || []);
//   };

  const fetchBlogs = async () => {
    const res = await axios.get("/api/v1/blogs");
    setBlogs(res.data || []);
  };

//   const fetchProjects = async () => {
//     const res = await axios.get("/api/v1/project/admin");
//     setProjects(res.data.data || []);
//   };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      };

      await axios.post("/api/v1/faq", payload);

      alert("FAQ Created");
      onClose();
      setForm({
        question: "",
        answer: "",
        category: "",
        tags: "",
        serviceId: "",
        blogId: "",
        projectId: "",
        isActive: true,
      });
    } catch (err) {
      alert("Error creating FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Question */}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Question</label>

            <input
              type="text"
              name="question"
              value={form.question}
              onChange={handleChange}
              placeholder="Enter FAQ question"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Answer */}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Answer</label>

            <textarea
              name="answer"
              rows="5"
              value={form.answer}
              onChange={handleChange}
              placeholder="Enter FAQ answer"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              <option value="architecture">Architecture</option>
              <option value="construction">Construction</option>
              <option value="interior">Interior</option>
              <option value="vastu">Vastu</option>
            </select>
          </div>

          {/* Tags */}

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>

            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="cost, house design"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Service */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Attach Service
            </label>

            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>

              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          {/* Blog */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Attach Blog
            </label>

            <select
              name="blogId"
              value={form.blogId}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>

              {blogs.map((blog) => (
                <option key={blog._id} value={blog._id}>
                  {blog.title}
                </option>
              ))}
            </select>
          </div>

          {/* Project */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Attach Project
            </label>

            <select
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>

              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* Active Toggle */}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.checked,
                })
              }
              className="w-4 h-4"
            />

            <label className="text-sm">Active FAQ</label>
          </div>

          {/* Submit */}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Saving..." : "Save FAQ"}
            </button>
          </div>
        </form>
    </div>
  );
};

export default CreateFaq;
