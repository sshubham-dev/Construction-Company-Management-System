import { useEffect, useState, useMemo } from "react";
import { getBlogs, deleteBlog } from "../../api/blogApi";
import { Link } from "react-router-dom";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBlogs = async () => {
    const res = await getBlogs();
    setBlogs(res.data);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog?")) return;
    await deleteBlog(id);
    fetchBlogs();
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchSearch = b.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || b.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [blogs, search, statusFilter]);

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-xl md:text-2xl font-semibold">Blogs</h2>

        <Link
          to="/cms/blog/editor"
          className="bg-black text-white px-4 py-2 rounded-lg text-center"
        >
          + Create Blog
        </Link>
      </div>

      {/* ===== Search + Filter ===== */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          placeholder="Search blogs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* ===== MOBILE CARD VIEW ===== */}
      <div className="space-y-4 md:hidden">
        {filteredBlogs.map((b) => (
          <div
            key={b._id}
            className="bg-white border rounded-xl p-4 space-y-3"
          >
            {b.featureImage?.secure_url && (
              <img
                src={b.featureImage.secure_url}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}

            <div>
              <p className="font-medium">{b.title}</p>
              <p className="text-xs text-gray-500">/{b.slug}</p>
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  b.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {b.status}
              </span>

              <p className="text-xs text-gray-400">
                {new Date(b.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-between text-sm">
              <Link to={`/cms/blog/edit/${b._id}`} className="text-blue-600">
                Edit
              </Link>

              <Link
                to={`/cms/blog/preview/${b._id}`}
                className="text-gray-700"
              >
                Preview
              </Link>

              <button
                onClick={() => handleDelete(b._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== DESKTOP TABLE VIEW ===== */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Blog</th>
              <th>Status</th>
              <th>Updated</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBlogs.map((b) => (
              <tr key={b._id} className="border-b hover:bg-gray-50">

                <td className="p-3 flex items-center gap-3">
                  {b.featureImage?.secure_url && (
                    <img
                      src={b.featureImage.secure_url}
                      className="w-14 h-14 rounded object-cover"
                    />
                  )}

                  <div>
                    <p className="font-medium">{b.title}</p>
                    <p className="text-xs text-gray-500">/{b.slug}</p>
                  </div>
                </td>

                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      b.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                <td>
                  {new Date(b.updatedAt).toLocaleDateString()}
                </td>

                <td className="p-3 text-right space-x-3">
                  <Link
                    to={`/cms/blog/edit/${b._id}`}
                    className="text-blue-600"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/cms/blog/preview/${b._id}`}
                    className="text-gray-700"
                  >
                    Preview
                  </Link>

                  <button
                    onClick={() => handleDelete(b._id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {filteredBlogs.length === 0 && (
        <p className="text-center text-gray-400">
          No blogs found
        </p>
      )}

    </div>
  );
}