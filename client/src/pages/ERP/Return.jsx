import { useState, useEffect } from "react";
import ReturnFormModal from "../../components/CreateReturn";

const Return = () => {
  const [returns, setReturns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentReturn, setCurrentReturn] = useState(null);

  // Fetch return data
  useEffect(() => {
    fetch("/api/returns")
      .then((res) => res.json())
      .then((data) => setReturns(data))
      .catch((err) => console.error("Error fetching returns:", err));
  }, []);

  // Open modal for edit or add
  const openModal = (data = null) => {
    setCurrentReturn(data);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentReturn(null);
  };

    const handleSave = (data) => {
    console.log("Form Submitted:", data);
    // Call API to save
  };

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this return?")) {
      setReturns(returns.filter((r) => r._id !== id));
      // Call API to delete
      fetch(`/api/returns/${id}`, { method: "DELETE" }).catch((err) =>
        console.error("Delete failed:", err)
      );
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Returns</h2>
      <button
        onClick={() => openModal()}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Return
      </button>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Site Name</th>
              <th className="p-3 border">Material Type</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="p-3 border">{item.site?.name || "N/A"}</td>
                <td className="p-3 border">{item.materialType}</td>
                <td className="p-3 border">{new Date(item.date).toLocaleDateString()}</td>
                <td className="p-3 border space-x-2">
                  <button
                    onClick={() => openModal(item)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ReturnFormModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} returnData={editData} />
      </div>

      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {currentReturn ? "Edit Return" : "Add Return"}
            </h3>
            <input
              type="text"
              placeholder="Site Name"
              className="w-full border p-2 mb-3 rounded"
              defaultValue={currentReturn?.site?.name || ""}
            />
            <select className="w-full border p-2 mb-3 rounded">
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Scrap">Scrap</option>
            </select>
            <input
              type="date"
              className="w-full border p-2 mb-3 rounded"
              defaultValue={currentReturn ? new Date(currentReturn.date).toISOString().split("T")[0] : ""}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-500 text-white rounded">
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                {currentReturn ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Return;
