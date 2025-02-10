import { useState, useEffect } from "react";

const ReturnFormModal = ({ isOpen, onClose, onSave, returnData }) => {
  const [formData, setFormData] = useState({
    siteName: "",
    materialType: "New",
    date: "",
    returnable: [{ item: "", quantity: 0, receivedQuantity: 0, unit: "", remarks: "" }],
  });

  useEffect(() => {
    if (returnData) {
      setFormData({
        siteName: returnData.site?.name || "",
        materialType: returnData.materialType || "New",
        date: returnData.date ? new Date(returnData.date).toISOString().split("T")[0] : "",
        returnable: returnData.returnable || [{ item: "", quantity: 0, receivedQuantity: 0, unit: "", remarks: "" }],
      });
    }
  }, [returnData]);

  const handleChange = (e, index = null, field = null) => {
    if (index !== null) {
      const newReturnables = [...formData.returnable];
      newReturnables[index][field] = e.target.value;
      setFormData({ ...formData, returnable: newReturnables });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      returnable: [...formData.returnable, { item: "", quantity: 0, receivedQuantity: 0, unit: "", remarks: "" }],
    });
  };

  const handleRemoveItem = (index) => {
    const newReturnables = formData.returnable.filter((_, i) => i !== index);
    setFormData({ ...formData, returnable: newReturnables });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
        <div className="bg-white py-7 px-5 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">{returnData ? "Edit Return" : "Add Return"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <input
                type="text"
                name="siteName"
                placeholder="Site Name"
                className="w-full border p-2 rounded"
                value={formData.siteName}
                onChange={handleChange}
                required
              />
              <select
                name="materialType"
                className="w-full border p-2 rounded"
                value={formData.materialType}
                onChange={handleChange}
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="Scrap">Scrap</option>
              </select>
              <input
                type="date"
                name="date"
                className="w-full border p-2 rounded"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">Returnable Items</h3>
            {formData.returnable.map((item, index) => (
              <div key={index} className="mb-3 p-3 border rounded relative bg-gray-50">
                <input
                  type="text"
                  placeholder="Item Name"
                  className="w-full border p-2 mb-2 rounded"
                  value={item.item}
                  onChange={(e) => handleChange(e, index, "item")}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    className="border p-2 rounded"
                    value={item.quantity}
                    onChange={(e) => handleChange(e, index, "quantity")}
                  />
                  <input
                    type="number"
                    placeholder="Received"
                    className="border p-2 rounded"
                    value={item.receivedQuantity}
                    onChange={(e) => handleChange(e, index, "receivedQuantity")}
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    className="border p-2 rounded"
                    value={item.unit}
                    onChange={(e) => handleChange(e, index, "unit")}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Remarks"
                  className="w-full border p-2 mt-2 rounded"
                  value={item.remarks}
                  onChange={(e) => handleChange(e, index, "remarks")}
                />
                {formData.returnable.length > 1 && (
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-red-500 text-sm"
                    onClick={() => handleRemoveItem(index)}
                  >
                    ✖ Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="w-full bg-blue-600 text-white p-2 rounded mt-2 hover:bg-blue-700"
              onClick={handleAddItem}
            >
              + Add More Item
            </button>

            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                {returnData ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default ReturnFormModal;
