import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("/api/v1/blogs");
        console.log(res.data);
        setBlogs(res.data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, []);
  const previewBlog = ({ id }) => {
    window.open(`http://localhost:8081/blog/preview/${id}`, "_blank");
  };
  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Blogs</h1>
        <Link to="/cms/blog/editor" className="bg-leaf px-4 py-2 rounded">
          New Blog
        </Link>
      </div>

      <table className="w-full text-sm bg-white border rounded">
        <thead className="bg-offwhite">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th>Status</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr key={blog._id} className="border-t">
              <td className="p-3">{blog.title}</td>
              <td>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    blog.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100"
                  }`}
                >
                  {blog.status}
                </span>
              </td>
              <td>{new Date(blog.updatedAt).toDateString()}</td>
              <td>
                <Link to={`/cms/blog/edit/${blog._id}`} className="text-leaf">
                  Edit
                </Link>
              </td>
              <td>
                <a
                  href={`http://localhost:8081/blog/preview/${blog._id}`}
                  target="_blank"
                  className="border px-6 py-2 rounded"
                >
                  Preview
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Blogs;
