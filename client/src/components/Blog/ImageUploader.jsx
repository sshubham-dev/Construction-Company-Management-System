import { uploadImage } from "../../api/blogApi";
import { useState, useEffect } from "react";

export default function ImageUploader({ form, setForm }) {
  const [preview, setPreview] = useState(form.featureImage || "");
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // preview immediately
    setPreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await uploadImage(fd); // 👈 CALL API
      console.log("Upload response", res);
      setForm({
        ...form,
        featureImage: {
          secure_url: res.data.url,
          public_id: res.data.public_id,
        }, // 👈 save directly // 👈 SAVE CLOUDINARY URL
      });
    } catch (err) {
      console.log("Upload error", err);
    }
  };
  useEffect(() => {
    setPreview(form.featureImage?.secure_url || "");
  }, [form.featureImage]);

  return (
    <div>
      <div className="bg-white space-y-3 ">
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
              {preview && (
                <button
                  onClick={() => {
                    setPreview("");
                    setForm({ ...form, featureImage: {
                      secure_url: "",
                      public_id: "",
                    } });
                  }}
                  className="text-sm text-red-500"
                >
                  Remove Image
                </button>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p className="font-medium">Click to upload feature image</p>
              <p className="text-xs">Recommended: 1200 x 630px</p>
            </div>
          )}

          <input
            id="featureUpload"
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e)}
            className="hidden"
          />
        </label>
      </div>

      {/* {form.featureImage && (
        <img
          src={form.featureImage}
          className="rounded mt-4 border-2 border-gray-950"
        />
      )} */}
    </div>
  );
}
