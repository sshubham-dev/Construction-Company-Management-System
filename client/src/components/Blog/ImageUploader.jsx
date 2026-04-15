import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { uploadImage } from "../../api/blogApi";
import toast from "react-hot-toast";

export default function ImageUploader({ form, setForm }) {
  const [preview, setPreview] = useState(form.featureImage?.secure_url || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(form.featureImage?.secure_url || "");
  }, [form.featureImage]);

const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  let toastId;

  try {
    setUploading(true);

    // ✅ show loading toast
    toastId = toast.loading("Uploading image...");

    // instant preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // compress
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    });

    const fd = new FormData();
    fd.append("image", compressedFile);

    const res = await uploadImage(fd);

    // update form
    setForm((prev) => ({
      ...prev,
      featureImage: {
        secure_url: res.data.url,
        public_id: res.data.public_id,
      },
    }));

    setPreview(res.data.url);

    // ✅ success toast (replaces loading)
    toast.success("Image uploaded successfully", { id: toastId });

  } catch (err) {
    console.log("Upload error", err);

    // ❌ error toast (replaces loading)
    toast.error("Upload failed. Try again.", { id: toastId });

  } finally {
    setUploading(false);
  }
};

  const handleRemove = (e) => {
    e.stopPropagation();

    setPreview("");

    setForm((prev) => ({
      ...prev,
      featureImage: {
        secure_url: "",
        public_id: "",
      },
    }));
  };

  return (
    <div className="bg-white space-y-3">
      <p className="text-lg font-semibold text-gray-700">Feature Image</p>

      <label
        htmlFor="featureUpload"
        className="group cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-black transition"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Feature Preview"
              className="w-full h-64 object-cover rounded-md mb-3"
            />

            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-500"
            >
              Remove Image
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500">
            <p className="font-medium">
              {uploading
                ? "Uploading image..."
                : "Click to upload feature image"}
            </p>
            <p className="text-xs">Recommended: 1200 x 630px</p>
          </div>
        )}

        <input
          id="featureUpload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {/* ✅ better UX feedback */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div className="bg-black h-2 w-full animate-pulse rounded"></div>
        </div>
      )}
    </div>
  );
}
