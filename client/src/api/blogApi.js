import axios from "axios";

export const getBlogs = () => axios.get("/api/v1/blogs");

export const getBlogById = (id) =>
  axios.get(`/api/v1/blogs/preview/${id}`);

export const createBlog = (data) =>
  axios.post("/api/v1/blogs", data);

export const updateBlog = (id, data) =>
  axios.put(`/api/v1/blogs/${id}`, data);

export const deleteBlog = (id) =>
  axios.delete(`/api/v1/blogs/${id}`);

export const uploadImage = (formData) =>
  axios.post("/api/v1/blogs/blog-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
