import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";
import moment from "moment";
import Select from "react-select";

axios.defaults.withCredentials = true;

const ReturnFormModal = ({
  onClose,
  onSave,
  returnData,
  editId,
  editIndex,
}) => {
  const [formData, setFormData] = useState({
    site: "",
    materialType: "New",
    date: "",
    returnable: [{ item: "", quantity: 0, unit: "" }],
  });
  const [sites, setSite] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [returnable, setReturnable] = useState([
    {
      item: "",
      quantity: 0,
      unit: "",
      receivedQuantity: 0,
      remarks: "",
      rate: 0,
    },
  ]);
  const [requestIdToEdit, setRequestIdToEdit] = useState(null);
  const [ItemToEdit, setItemToEdit] = useState({ id: "", index: "" });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (editId && editIndex !== undefined) {
      fetchReturnDetail(editId, editIndex);
      setItemToEdit({ id: editId, index: editIndex });
    } else if (editId) {
      setRequestIdToEdit(editId);
      fetchReturnRequest(editId);
    }
  }, [editId]);
  const fetchReturnRequest = async (id) => {
    try {
      const response = await axios.get(`/api/v1/return/${id}`);
      console.log(response.data);
      setFormData({
        site: response.data.site?.id._id || "",
        materialType: response.data.materialType || "New",
        date: response.data.date
          ? new Date(response.data.date).toISOString().split("T")[0]
          : "",
        returnable: [{ item: "", quantity: 0, unit: "" }],
      });
      setRequestIdToEdit(id);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchReturnDetail = async (id, index) => {
    try {
      const response = await axios.get(`/api/v1/return/${id}/item`);
      console.log(response.data);
      const returnableItem = response.data[index];
      setReturnable({
        item: returnableItem.item || "",
        quantity: returnableItem.quantity || 0,
        unit: returnableItem.unit || "",
        receivedQuantity: returnableItem.receivedQuantity || 0,
        remarks: returnableItem.remarks || "",
        rate: returnableItem.rate || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user && user?.department === "Site Incharge") {
      console.log(user._id);
      getUserSites(user._id);
    } else if (user && user?.department === "Site Supervisor") {
      console.log(user);
      getUserSites(user._id);
    } else if (user && user?.department === "Client") {
      console.log(user);
      getUserSites(user._id);
    } else {
      const getSites = async () => {
        try {
          const siteData = await axios.get("/api/v1/site");
          setSite(siteData.data);
          console.log(siteData.data);
        } catch (error) {
          console.error(error);
          setError(error.message);
        }
      };
      getSites();
    }
  }, []);

  useEffect(() => {
    if (!formData.salesInvoiceId) return;

    const loadInvoiceItems = async () => {
      const { data } = await axios.get(
        `/api/v1/sales-invoice/${formData.salesInvoiceId}`
      );

      setFormData((prev) => ({
        ...prev,
        returnable: data.items.map((item) => ({
          item: item.item, // locked
          unit: item.unit, // locked
          quantity: 0, // user editable
        })),
      }));
    };

    loadInvoiceItems();
  }, [formData.salesInvoiceId]);

  const getUserSites = async (id) => {
    try {
      const siteData = await axios.get(`/api/v1/site/user/${id}`);
      console.log(siteData.data);
      setSite(siteData.data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };
  console.log(sites);

  useEffect(() => {
    if (returnData) {
      setFormData({
        site: returnData.site?.name || "",
        materialType: returnData.materialType || "New",
        date: returnData.date
          ? new Date(returnData.date).toISOString().split("T")[0]
          : "",
        returnable: returnData.returnable || [
          { item: "", quantity: 0, unit: "" },
        ],
      });
    }
  }, [returnData]);

  const handleChange = (e, index = null, field = null) => {
    const { name, value } = e.target;

    setFormData((prevState) => {
      if (index !== null) {
        // Updating a specific returnable item
        const updatedReturnables = [...prevState.returnable];
        updatedReturnables[index] = {
          ...updatedReturnables[index],
          [field]: value, // Ensure deep update
        };
        return { ...prevState, returnable: updatedReturnables };
      } else {
        // Updating top-level fields
        return { ...prevState, [name]: value };
      }
    });
  };
  const handleReturnableChange = (field, value) => {
    setReturnable((prevState) => ({
      ...prevState,
      [field]: value, // Ensure deep update
    }));
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      returnable: [...formData.returnable, { item: "", quantity: 0, unit: "" }],
    });
  };

  const handleRemoveItem = (index) => {
    const newReturnables = formData.returnable.filter((_, i) => i !== index);
    setFormData({ ...formData, returnable: newReturnables });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(formData);
      if (ItemToEdit.id && ItemToEdit.index !== undefined) {
        const response = await axios.put(
          `/api/v1/return/${ItemToEdit.id}/item/${ItemToEdit.index}`,
          returnable
        );
        console.log(response);
        onClose();
        dispatch(fetchNotifications(user._id));
      } else if (requestIdToEdit) {
        console.log(formData);
        const response = await axios.put(
          `/api/v1/return/${requestIdToEdit}`,
          formData
        );
        console.log(response.data);
        onClose();
        dispatch(fetchNotifications(user._id));
        // onSave(formData);
      } else {
        const response = await axios.post("/api/v1/return", formData);
        console.log(response);
        onClose();
        onSave(formData);
        dispatch(fetchNotifications(user._id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReset = () => {
    setFormData({
      site: "",
      materialType: "New",
      date: "",
      returnable: [{ item: "", quantity: 0, unit: "" }],
    });
    setReturnable([
      {
        item: "",
        quantity: 0,
        unit: "",
      },
    ]);
    setItemToEdit({ id: "", index: "" });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {ItemToEdit.id && ItemToEdit.index !== undefined ? (
          <div className="">
            <div className="mb-2">
              <label
                htmlFor="item"
                className="block text-sm font-semibold text-gray-600"
              >
                Item
              </label>
              <input
                type="text"
                name="item"
                id="item"
                placeholder="Item Name"
                disabled={true}
                className="w-full border p-2 mb-2 rounded"
                value={returnable.item}
                onChange={(e) => handleReturnableChange("item", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div className="mb-2">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-gray-600"
                >
                  Quantity:
                </label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Qty"
                  className="border p-2 rounded"
                  value={returnable.quantity}
                  onChange={(e) =>
                    handleReturnableChange("quantity", e.target.value)
                  }
                />
              </div>
              <div className="mb-2">
                <label
                  htmlFor="unit"
                  className="block text-sm font-semibold text-gray-600"
                >
                  Unit:
                </label>
                <input
                  type="text"
                  name="unit"
                  placeholder="Unit"
                  className="border p-2 rounded"
                  value={returnable.unit}
                  onChange={(e) =>
                    handleReturnableChange("unit", e.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handleReset}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 ml-6 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="mb-4">
                <label
                  htmlFor="site"
                  className="block text-sm font-semibold text-gray-600"
                >
                  Site
                </label>
                <select
                  name="site"
                  value={formData.site}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  onChange={handleChange}
                >
                  <option>Select Site</option>
                  {sites.map((site, index) => (
                    <option key={index} value={site._id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div className="mb-4">
                <label
                  htmlFor="materialType"
                  className="block text-sm font-semibold text-gray-600"
                >
                  Material Type
                </label>
<select
  name="salesInvoiceId"
  value={formData.salesInvoiceId}
  onChange={handleChange}
  className="input"
  required
>
  <option value="">Select Sales Invoice</option>
  {salesInvoices.map(inv => (
    <option key={inv._id} value={inv._id}>
      {inv.invoiceNo}
    </option>
  ))}
</select>

              </div> */}
              <div className="mb-4">
                <label
                  htmlFor="materialType"
                  className="block text-sm font-semibold text-gray-600"
                >
                  Material Type
                </label>
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
              </div>
              <div className="mb-4">
                <label
                  htmlFor="date"
                  className="block text-sm font-semibold text-gray-600"
                >
                  Date: {moment(formData.date).format("DD-MM-YYYY")}
                </label>
                <input
                  type="date"
                  name="date"
                  className="w-full border p-2 rounded"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-2">
              Returnable Items
            </h3>
            {formData.returnable.map((item, index) => (
              <div
                key={index}
                className="mb-3 p-2 relative flex flex-col gap-1"
              >
                {formData.returnable.length > 1 && (
                  <button
                    type="button"
                    className=" text-red-500 text-sm self-end"
                    onClick={() => handleRemoveItem(index)}
                  >
                    ✖ Remove
                  </button>
                )}
                <div className="mb-2">
                  <label
                    htmlFor="item"
                    className="block text-sm font-semibold text-gray-600"
                  >
                    Item
                  </label>
                  <input
                    type="text"
                    placeholder="Item Name"
                    className="w-full border p-2 mb-2 rounded"
                    value={item.item}
                    disabled={true}
                    onChange={(e) => handleChange(e, index, "item")}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-semibold text-gray-600"
                  >
                    Quantity:
                  </label>
                  <input
                    type="number"
                    placeholder="Qty"
                    className="border p-2 rounded"
                    value={item.quantity}
                    onChange={(e) => handleChange(e, index, "quantity")}
                  />
                  <label
                    htmlFor="unit"
                    className="block text-sm font-semibold text-gray-600"
                  >
                    Unit:
                  </label>
                  <input
                    type="text"
                    placeholder="Unit"
                    className="border p-2 rounded"
                    value={item.unit}
                    onChange={(e) => handleChange(e, index, "unit")}
                  />
                </div>
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
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default ReturnFormModal;
