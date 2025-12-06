import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
axios.defaults.withCredentials = true;

// function WorkDetailsForm({ onClose, id, index }) {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [workDetail, setWorkDetail] = useState({
//     title: "",
//     description: [
//       {
//         work: "",
//       },
//     ],
//   });
//   const [workToEdit, setWorkToEdit] = useState({
//     id: "",
//     index: "",
//   });
//   const [workDetailsToEdit, setWorkDetailsToEdit] = useState();

//   useEffect(() => {
//     if (id && index !== undefined) {
//       setWorkToEdit({ id, index });
//       fetchDescription(id, index);
//       console.log(id);
//     } else if (id) {
//       fetchWorkDetail(id);
//       setWorkDetailsToEdit(id);
//     }
//   }, []);

//   const fetchWorkDetail = async (id) => {
//     try {
//       const response = await axios.get(`/api/v1/work-details/${id}`);
//       setWorkDetail({
//         title: response.data?.title,
//         description: [
//           {
//             work: "",
//           },
//         ],
//       });
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const fetchDescription = async (id, index) => {
//     try {
//       const response = await axios.get(`/api/v1/work-details/${id}`);
//       setWorkDetail({
//         title: response.data?.title,
//         description: [
//           {
//             work: response.data?.description[index].work,
//           },
//         ],
//       });
//       console.log(response.data?.description[index]);
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handelChange = (e, index) => {
//     const { name, value } = e.target;
//     if (name === "work") {
//       setWorkDetail((prevWorkDetail) => {
//         const newDescription = [...prevWorkDetail.description];
//         newDescription[index] = {
//           ...newDescription[index],
//           [name]: value,
//         };
//         return {
//           ...prevWorkDetail,
//           description: newDescription,
//         };
//       });
//     } else {
//       // Update other fields outside the description array
//       setWorkDetail({
//         ...workDetail,
//         [name]: value,
//       });
//     }
//   };

//   const moreWork = () => {
//     setWorkDetail((workDetail) => ({
//       ...workDetail,
//       description: [
//         ...workDetail.description,
//         {
//           work: "",
//         },
//       ],
//     }));
//   };

//   const removeWork = (index) => {
//     setWorkDetail((prevWorkDetail) => {
//       const updatedDescription = [...prevWorkDetail.description];
//       updatedDescription.splice(index, 1); // Remove the entry at the specified index
//       return {
//         ...prevWorkDetail,
//         description: updatedDescription,
//       };
//     });
//   };

//   const createWorkDetails = async (e) => {
//     e.preventDefault();
//     try {
//       if (workDetailsToEdit) {
//         console.log(workDetailsToEdit);
//         console.log(workDetail);
//         const response = await axios.put(
//           `/api/v1/work-details/${workDetailsToEdit}`,
//           workDetail
//         );
//         toast.success(response.data.message);
//         onClose();
//       } else if (workToEdit.id !== "" && workToEdit.index !== "") {
//         const response = await axios.put(
//           `/api/v1/work-details/${workToEdit.id}/${workToEdit.index}`,
//           workDetail
//         );
//         toast.success(response.data.message);
//         onClose();
//       } else {
//         const response = await axios.post("/api/v1/work-details", workDetail);
//         toast.success(response.data.message);
//         onClose();
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleFileChange = (e) => setFile(e.target.files[0]);

//   const handleImport = async () => {
//     if (!file) return toast.error("Please select an Excel file");
//     setLoading(true);

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await axios.post("/api/v1/work-details/imports", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       toast.success(res.data.message);
//       console.log("Results:", res.data.results);
//     } catch (error) {
//       console.error(error);
//       toast.error("Import failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <form className="max-w-md mx-auto " onSubmit={createWorkDetails}>
//         <div className="mb-4">
//           <label
//             htmlFor="title"
//             className="block text-sm font-semibold text-gray-600"
//           >
//             Work Title
//           </label>
//           <input
//             type="text"
//             name="title"
//             value={workDetail.title}
//             required
//             onChange={handelChange}
//             className="border p-2 rounded w-full"
//           />
//         </div>

//         <div className="mt-4">
//           <h2 className="text-lg font-semibold mb-2">Work Description</h2>
//           {workDetail?.description?.map((works, index) => (
//             <div className="mb-4" key={index}>
//               <label
//                 htmlFor="description"
//                 className="block text-sm font-semibold text-gray-600"
//               >
//                 Work
//               </label>
//               <div className="flex">
//                 <input
//                   type="text"
//                   name="work"
//                   value={works.work}
//                   required
//                   onChange={(e) => handelChange(e, index)}
//                   className="border p-2 rounded text-pretty w-full"
//                 />

//                 {workDetail.description.length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => removeWork(index)}
//                     className="bg-red-500 text-white p-2 rounded ml-2"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//           {id ? (
//             ""
//           ) : (
//             <button
//               type="button"
//               onClick={moreWork}
//               className="bg-blue-500 text-white p-2 rounded mt-4"
//             >
//               Add More
//             </button>
//           )}
//         </div>

//         <h2 className="text-lg text-center font-semibold my-4">OR</h2>
//         <div className="mb-4">
//           <label
//             htmlFor="title"
//             className="block text-sm font-semibold text-gray-600"
//           >
//             Import From Excel ( .csv, .xlsx, .xls )
//           </label>
//           <input
//             type="file"
//             accept=".xlsx, .xls, .csv"
//             onChange={handleFileChange}
//           />
//         </div>

//         <button
//           onClick={handleImport}
//           disabled={loading}
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           {loading ? "Importing..." : "Import Excel"}
//         </button>

//         <button
//           type="button"
//           onClick={createWorkDetails}
//           className="bg-green-500 text-white p-2 rounded mt-4"
//         >
//           {id ? "Update" : "Create"} Work Detail
//         </button>
//       </form>
//       <Toaster position="top-right" reverseOrder={false} />
//     </div>
//   );
// }

// export default WorkDetailsForm;

function WorkDetailsForm({ onClose, id, index }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workDetail, setWorkDetail] = useState({
    title: "",
    description: [{ work: "" }],
  });

  useEffect(() => {
    if (id && index !== undefined) {
      fetchDescription(id, index);
    } else if (id) {
      fetchWorkDetail(id);
    }
  }, [id, index]);

  const fetchWorkDetail = async (id) => {
    try {
      const res = await axios.get(`/api/v1/work-details/${id}`);
      setWorkDetail({
        title: res.data?.title,
        description: res.data?.description?.length
          ? res.data.description
          : [{ work: "" }],
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchDescription = async (id, index) => {
    try {
      const res = await axios.get(`/api/v1/work-details/${id}`);
      const single = res.data?.description[index];
      setWorkDetail({
        title: res.data?.title,
        description: single ? [{ work: single.work }] : [{ work: "" }],
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChange = (e, idx) => {
    const { name, value } = e.target;
    if (name === "work") {
      const newDesc = [...workDetail.description];
      newDesc[idx][name] = value;
      setWorkDetail({ ...workDetail, description: newDesc });
    } else {
      setWorkDetail({ ...workDetail, [name]: value });
    }
  };

  const addWork = () => {
    setWorkDetail((prev) => ({
      ...prev,
      description: [...prev.description, { work: "" }],
    }));
  };

  const removeWork = (idx) => {
    setWorkDetail((prev) => ({
      ...prev,
      description: prev.description.filter((_, i) => i !== idx),
    }));
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      // If user uploaded Excel file
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        if (id) {
          // Update one WorkDetail with Excel
          response = await axios.put(
            `/api/v1/work-details/${id}/imports`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
        } else {
          // Import all or create new ones from Excel
          response = await axios.post(
            "/api/v1/work-details/imports",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
        }

        toast.success(response.data.message);
      } else {
        // Manual form submit (no Excel)
        if (id) {
          response = await axios.put(`/api/v1/work-details/${id}`, workDetail);
        } else {
          response = await axios.post("/api/v1/work-details", workDetail);
        }
        toast.success(response.data.message);
      }

      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Save failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white">
      <form onSubmit={handleSave}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600">
            Work Title
          </label>
          <input
            type="text"
            name="title"
            value={workDetail.title}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Work Description</h3>
          {workDetail.description.map((item, idx) => (
            <div className="mb-2 flex items-center" key={idx}>
              <input
                type="text"
                name="work"
                value={item.work}
                onChange={(e) => handleChange(e, idx)}
                className="border p-2 rounded w-full"
                placeholder="Enter work"
              />
              {workDetail.description.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWork(idx)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addWork}
            className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
          >
            + Add More
          </button>
        </div>

        <h2 className="text-center text-gray-600 my-4">OR</h2>

        {/* Excel Import */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600">
            Import from Excel (.xlsx, .xls, .csv)
          </label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>

        {/* Single Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white w-full py-2 rounded mt-3"
        >
          {loading
            ? "Saving..."
            : id
            ? "Update Work Detail"
            : "Create Work Detail"}
        </button>
      </form>

      <Toaster position="top-right" />
    </div>
  );
}

export default WorkDetailsForm;
