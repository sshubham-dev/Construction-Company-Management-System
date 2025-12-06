import React, { useState, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const quillRef = useRef(null);
    const [loading, setLoading] = useState(false);

  // Thumbnail preview
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Inline image upload
  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch("/api/uploads/image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        const quill = quillRef.current?.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", data.url);
        quill.setSelection(range.index + 1);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    };
  };

  // Toolbar options (modern, clean)
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      handlers: { image: handleImageUpload },
    },
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (!title.trim() || !content.trim()) {
      alert("Please enter both title and content.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("status", status);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    // onSubmit(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Create Blog Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <input
          type="text"
          placeholder="Enter blog title..."
          className="w-full border border-gray-300 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm text-gray-700 mb-2 font-medium">
            Thumbnail Image
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="border border-gray-300 rounded-lg p-2 text-sm"
            />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-28 h-20 object-cover rounded-lg border border-gray-200"
              />
            )}
          </div>
        </div>

        {/* Post Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <label className="text-sm text-gray-600 font-medium">
            Post Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="draft">Draft</option>
            <option value="published">Publish</option>
          </select>
        </div>

        {/* Blog Editor */}
        <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[300px] sm:min-h-[400px]">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder="Write your blog post here..."
            className="h-[300px] sm:h-[400px]"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Save Blog"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
