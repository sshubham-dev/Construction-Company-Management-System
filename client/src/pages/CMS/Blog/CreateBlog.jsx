import { useNavigate } from "react-router-dom";
import BlogForm from "../../../components/Blog/BlogForm";
import { createBlog } from "../../../api/blogApi";

export default function CreateBlog() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await createBlog(data);
    navigate("/cms/blogs");
  };

  return <BlogForm onSubmit={handleSubmit} />;
}

