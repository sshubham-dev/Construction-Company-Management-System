import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";
import Select from "react-select";
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import CreateStock from "./CreateStock";
import Modal from "./Modal";
import moment from "moment";

const CreatePurchaseRequest = ({ onClose, id, index }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [sites, setSites] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategory] = useState([]);
  const [materials, setMaterial] = useState([]);
  const [orderFor, setOrderFor] = useState([]);

  const [createModal, setCreateModal] = useState(false);
  const [item, setItem] = useState(null);

  const units = [
    "SQFT",
    "RFT",
    "LUMSUM",
    "NOS",
    "FIXED",
    "RMT",
    "SQMT",
    "CUM",
    "BAG",
    "KG",
    "TONES",
    "LITERS",
  ];

  const [formData, setFormData] = useState({
    site: "",
    store: "",
    reqDate: "",
    requirementFor: "",
    category: "",
    items: [
      {
        itemId: "",
        item: "",
        unit: "",
        requestedQty: 0,
      },
    ],
  });

  const [purchaseReqToEdit, setPurchaseReqToEdit] = useState(null);

  /* =========================
     LOAD MASTER DATA
  ========================== */
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [storeRes, categoryRes] = await Promise.all([
          axios.get("/api/v1/store"),
          axios.get("/api/v1/stock-group"),
        ]);

        setStores(storeRes.data);
        setCategory(categoryRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadMasters();
  }, []);
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
          setSites(siteData.data);
          console.log(siteData.data);
        } catch (error) {
          console.error(error);
          setError(error.message);
        }
      };
      getSites();
    }
    const fetchCategory = async () => {
      try {
        const response = await axios.get("/api/v1/stock-group");
        setCategory(response.data);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategory();
  }, [user]);

  const getUserSites = async (id) => {
    try {
      const siteData = await axios.get(`/api/v1/site/user/${id}`);
      console.log(siteData.data);
      setSites(siteData.data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };
  /* =========================
     EDIT MODE LOAD
  ========================== */
  useEffect(() => {
    if (!id) return;

    setPurchaseReqToEdit(id);

    const fetchPR = async () => {
      try {
        const res = await axios.get(`/api/v1/purchase-request/${id}`);

        setFormData({
          site: res.data.site?.id._id || "",
          store: res.data.store?.id || "",
          reqDate: res.data.reqDate || "",
          requirementFor: res.data.requirementFor || "",
          category: res.data.category || "",
          items: res.data.items || [],
        });

        fetchMaterial(res.data.category);
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchPR();
  }, [id]);

  /* =========================
     FETCH MATERIALS
  ========================== */
  useEffect(() => {
    if (formData.category) {
      fetchMaterial(formData.category);
    }
  }, [formData.category]);

  const fetchMaterial = async (categoryName) => {
    try {
      const res = await axios.get("/api/v1/stock");
      setMaterial(res.data.filter((i) => i.category === categoryName));
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     HANDLERS
  ========================== */
  const handleChange = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleRequirementChange = (field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];

      if (field === "item") {
        updated[step - 1].itemId = value.value;
        updated[step - 1].item = value.label;
      } else if (field === "item-new") {
        updated[step - 1].itemId = null;
        updated[step - 1].item = value;
        setCreateModal(true);
        setItem({ name: value });
      } else {
        updated[step - 1][field] = value;
      }

      return { ...prev, items: updated };
    });
  };

  const handleNext = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { itemId: "", item: "", unit: "", requestedQty: 0 },
      ],
    }));
    setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (purchaseReqToEdit) {
        const res = await axios.put(
          `/api/v1/purchase-request/${purchaseReqToEdit}`,
          formData
        );
        toast.success(res.data.message);
      } else {
        const res = await axios.post("/api/v1/purchase-request", formData);
        toast.success(res.data.message);
      }

      dispatch(fetchNotifications(user._id));
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save purchase request");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div>
      <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
        {step === 0 && (
          <>
            {/* SITE */}
            <div className="mb-4">
              <label className="block text-sm font-semibold">Site</label>
              <select
                value={formData.site}
                onChange={(e) => handleChange("site", e.target.value)}
                className="border p-2 w-full"
              >
                <option value="">Select Site</option>
                {sites.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* STORE */}
            <div className="mb-4">
              <label className="block text-sm font-semibold">
                Store (Optional)
              </label>
              <select
                value={formData.store}
                onChange={(e) => handleChange("store", e.target.value)}
                className="border p-2 w-full"
              >
                <option value="">Select Store</option>
                {stores.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE */}
            <div className="mb-4">
              <label className="block text-sm font-semibold">
                Required Date
              </label>
              <input
                type="date"
                value={formData.reqDate}
                onChange={(e) => handleChange("reqDate", e.target.value)}
                className="border p-2 w-full"
              />
            </div>

            {/* CATEGORY */}
            <div className="mb-4">
              <label className="block text-sm font-semibold">
                Material Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="border p-2 w-full"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Items
            </button>
          </>
        )}

        {step > 0 && (
          <>
            <CreatableSelect
              value={{
                value: formData.items[step - 1]?.itemId,
                label: formData.items[step - 1]?.item,
              }}
              onChange={(v) => handleRequirementChange("item", v)}
              onCreateOption={(v) => handleRequirementChange("item-new", v)}
              options={materials.map((m) => ({ value: m._id, label: m.name }))}
            />

            <input
              type="number"
              className="border p-2 w-full mt-2"
              placeholder="Quantity"
              value={formData.items[step - 1]?.requestedQty}
              onChange={(e) =>
                handleRequirementChange("requestedQty", e.target.value)
              }
            />

            <select
              className="border p-2 w-full mt-2"
              value={formData.items[step - 1]?.unit}
              onChange={(e) => handleRequirementChange("unit", e.target.value)}
            >
              <option value="">Select Unit</option>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            <div className="flex justify-between mt-4">
              <button type="button" onClick={handlePrevious} className="btn">
                Previous
              </button>
              <button type="button" onClick={handleNext} className="btn">
                Next
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </form>

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)}>
        <CreateStock onClose={() => setCreateModal(false)} item={item} />
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
};

export default CreatePurchaseRequest;
