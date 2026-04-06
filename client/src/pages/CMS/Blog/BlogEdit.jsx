import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlogForm from "../../../components/Blog/BlogForm";
import { getBlogById, updateBlog } from "../../../api/blogApi";

export default function BlogEdit() {
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

  if (!blog) return <div>Loading...</div>;

  const handleSubmit = async (data) => {
    // console.log("update data:", data)
    await updateBlog(id, data);
    navigate("/cms/blogs");
  };

  return (
    <BlogForm initialData={blog} onSubmit={handleSubmit} />
  );
}
