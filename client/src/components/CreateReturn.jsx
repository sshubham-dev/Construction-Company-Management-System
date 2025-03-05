import { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const ReturnFormModal = ({ onClose, onSave, returnData }) => {
  const [formData, setFormData] = useState({
    site: "",
    materialType: "New",
    date: "",
    returnable: [{ item: "", quantity: 0, unit: "", }],
  });

  useEffect(() => {
    if (returnData) {
      setFormData({
        site: returnData.site?.name || "",
        materialType: returnData.materialType || "New",
        date: returnData.date ? new Date(returnData.date).toISOString().split("T")[0] : "",
        returnable: returnData.returnable || [{ item: "", quantity: 0, receivedQuantity: 0, unit: "", remarks: "" }],
      });
    }
  }, [returnData]);

  const handleChange = (e, index = null, field = null) => {
    const { name, value } = e.target;

    setFormData(prevState => {
      if (index !== null) {
        // Updating a specific returnable item
        const updatedReturnables = [...prevState.returnable];
        updatedReturnables[index] = {
          ...updatedReturnables[index],
          [field]: value,  // Ensure deep update
        };
        return { ...prevState, returnable: updatedReturnables };
      } else {
        // Updating top-level fields
        return { ...prevState, [name]: value };
      }
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData)
      const response = await axios.post('/api/v1/return', formData)
      console.log(response);
      onClose();
      onSave(formData);
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div >
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          <input
            type="text"
            name="site"
            placeholder="Site Name"
            className="w-full border p-2 rounded"
            value={formData.site}
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
          <div key={index} className="mb-3 p-3 border rounded relative bg-gray-50 flex flex-col gap-1">
            {formData.returnable.length > 1 && (
              <button
                type="button"
                className=" text-red-500 text-sm self-end"
                onClick={() => handleRemoveItem(index)}
              >
                ✖ Remove
              </button>
            )}
            <input
              type="text"
              placeholder="Item Name"
              className="w-full border p-2 mb-2 rounded"
              value={item.item}
              onChange={(e) => handleChange(e, index, "item")}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* <input
                    type="number"
                    placeholder="Received"
                    className="border p-2 rounded"
                    value={item.receivedQuantity}
                    onChange={(e) => handleChange(e, index, "receivedQuantity")}
                  /> */}
              <input
                type="number"
                placeholder="Qty"
                className="border p-2 rounded"
                value={item.quantity}
                onChange={(e) => handleChange(e, index, "quantity")}
              />

              <input
                type="text"
                placeholder="Unit"
                className="border p-2 rounded"
                value={item.unit}
                onChange={(e) => handleChange(e, index, "unit")}
              />
            </div>
            {/* <input
                  type="text"
                  placeholder="Remarks"
                  className="w-full border p-2 mt-2 rounded"
                  value={item.remarks}
                  onChange={(e) => handleChange(e, index, "remarks")}
                /> */}

          </div>
        ))}

        <button
          type="button"
          className=" bg-blue-600 text-white py-2 px-3 rounded mt-2 hover:bg-blue-700"
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
  );
};

export default ReturnFormModal;
