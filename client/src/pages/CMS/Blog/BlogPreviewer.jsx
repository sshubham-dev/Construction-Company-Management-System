import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBlogById } from "../../../api/blogApi";
import DOMPurify from "dompurify";

export default function BlogPreviewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await getBlogById(id);
      setBlog(res.data);
    };
    load();
  }, [id]);

  if (!blog) {
    return (
      <div className="p-6 text-center text-gray-400">Loading preview...</div>
    );
  }

  return (
    <div className="min-h-screen py-2 px-2">
      {/* ===== Top Bar ===== */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          ← Go Back
        </button>
      </div>

      <article className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-10 space-y-6">
        {blog.featureImage?.secure_url && (
          <img
            src={blog.featureImage.secure_url}
            alt={blog.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        )}

        <h1 className="text-2xl md:text-4xl font-semibold leading-tight">
          {blog.title}
        </h1>

        {blog.shortDescription && (
          <p className="text-gray-600 text-lg">{blog.shortDescription}</p>
        )}

        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(blog.content),
          }}
        />
      </article>
    </div>
  );
}
