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
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    site: "",
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
  const [materials, setMaterial] = useState([]);
  const [categories, setCategory] = useState([]);
  const [sites, setSite] = useState([]);
  const [orderFor, setOrderFor] = useState([]);
  const [createModal, setCreateModal] = useState(false);
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
  const [requirementToEdit, setRequirementToEdit] = useState({
    id: "",
    index: "",
  });
  const [requirement, setRequirement] = useState({
    itemId: "",
    item: "",
    unit: "",
    requestedQty: 0,
  });
  const [purchaseReqToEdit, setPurchaseReqToEdit] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const [item, setItem] = useState("");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (id && index !== undefined) {
      setRequirementToEdit({ id, index });
      fetchPurchaseDetail(id, index);
    } else if (id) {
      setPurchaseReqToEdit(id);
      fetchPurchaseRequest(id);
    }
  }, [id, index]);

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
      setSite(siteData.data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const selectedSite = sites.filter((site) => site._id === formData.site)[0];
    console.log(selectedSite);
    console.log(selectedSite?.projectSchedule?.projectDetail);
    setOrderFor(selectedSite?.projectSchedule?.projectDetail);
    const fetchProjectSchedule = async () => {
      try {
        const projectScheduleData = await axios.get("/api/v1/project-schedule");
        console.log(projectScheduleData.data);
        const filteredProjectSchedules = projectScheduleData.data.filter(
          (projectSchedule) => projectSchedule.site?.id._id === formData.site
        )[0];
        const filteredProjectDetail =
          filteredProjectSchedules?.projectDetail.filter(
            (detail) =>
              detail?.status?.toLowerCase() !== "completed" &&
              detail?.status?.toLowerCase() !== "pending"
          );

        console.log(filteredProjectSchedules);
        console.log(filteredProjectDetail);
        setOrderFor(filteredProjectDetail);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjectSchedule();
  }, [formData.site]);

  useEffect(() => {
    fetchMaterial(formData.category);
  }, [formData.category]);

  const fetchPurchaseRequest = async (id) => {
    try {
      const response = await axios.get(`/api/v1/purchase-request/${id}`);
      console.log(response.data);
      setFormData({
        site: response.data.site.id._id,
        reqDate: response.data.reqDate,
        requirementFor: response.data.requirementFor,
        category: response.data.category,
        items: [
          {
            itemId: "",
            item: "",
            unit: "",
            requestedQty: 0,
          },
        ],
      });
      fetchMaterial(response.data.category);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchPurchaseDetail = async (id, index) => {
    try {
      const response = await axios.get(`/api/v1/purchase-request/${id}`);
      const requirement = response?.data?.items[index];
      setRequirement({
        itemId: requirement?.itemId || "",
        item: requirement?.item || "",
        unit: requirement?.unit || "",
        requestedQty: requirement?.requestedQty || 0,
      });
      fetchMaterial(response.data.category);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchMaterial = async (categoryName) => {
    try {
      const response = await axios.get("/api/v1/stock");
      const stockByCategory = response.data.filter(
        (item) => item.category === categoryName
      );
      console.log(response.data);
      setMaterial(stockByCategory);
      console.log(stockByCategory);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleNext = () => {
    setFormData((prevState) => {
      const updatedRequirement = [...prevState.items];

      // If current step is a new one, push an empty object
      if (step === updatedRequirement.length) {
        updatedRequirement.push({
          itemId: "",
          item: "",
          unit: "",
          requestedQty: 0,
        });
      }

      return { ...prevState, items: updatedRequirement };
    });

    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleEdit = (field, value) => {
    if (requirementToEdit.index !== undefined && requirementToEdit.id) {
      // Existing material selected
      if (field === "item") {
        setRequirement((prev) => ({
          ...prev,
          itemId: value.value, // store ID
          item: value.label, // store name
        }));
        return;
      }

      // New material created
      if (field === "item-new") {
        setRequirement((prev) => ({
          ...prev,
          itemId: null,
          item: value,
        }));
        return;
      }

      // Other fields (unit, qty)
      setRequirement((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleChange = (name, value) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleRequirementChange = (field, value) => {
    setFormData((prevState) => {
      const updated = [...prevState.items];

      // When selecting existing material
      if (field === "item") {
        updated[step - 1].itemId = value.value; // store ID
        updated[step - 1].item = value.label; // store name
        return { ...prevState, items: updated };
      }

      // When creating new material
      if (field === "item-new") {
        updated[step - 1].itemId = null; // no ID yet
        updated[step - 1].item = value; // store typed name
        setCreateModal(true);
        setItem({ name: value });
        return { ...prevState, items: updated };
      }

      // For qty and unit
      updated[step - 1][field] = value;

      return { ...prevState, items: updated };
    });
  };

  const handleCreateNewMaterial = async (newItemName) => {
    setCreateModal(true);
    setItem({ name: newItemName });
  };

  const handleReset = () => {
    setFormData({
      site: "",
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
    setStep(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // console.log(formData);
    try {
      if (purchaseReqToEdit) {
        console.log(formData);
        const response = await axios.put(
          `/api/v1/purchase-request/${purchaseReqToEdit}`,
          formData
        );
        toast.success(response.data.message);
        setLoading(false);
        dispatch(fetchNotifications(user._id));
        onClose();
      } else if (
        requirementToEdit.id &&
        requirementToEdit.index !== undefined
      ) {
        // console.log(requirement);
        const response = await axios.put(
          `/api/v1/purchase-request/${requirementToEdit.id}/requirement/${requirementToEdit.index}`,
          requirement
        );
        toast.success(response.data.message);
        setLoading(false);
        dispatch(fetchNotifications(user._id));
        onClose();
      } else {
        console.log(formData);
        const response = await axios.post("/api/v1/purchase-request", formData);
        toast.success(response.data.message);
        onClose();
        dispatch(fetchNotifications(user._id));
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting purchase request:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
        {requirementToEdit.index !== undefined && requirementToEdit.id ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mt-4">
                Material
              </label>
              <CreatableSelect
                value={{
                  value: requirement?.itemId,
                  label: requirement?.item,
                }}
                onChange={(selectedOption) =>
                  handleEdit("item", selectedOption)
                }
                onCreateOption={(newValue) => handleEdit("item-new", newValue)}
                options={materials.map((m) => ({
                  value: m._id,
                  label: m.name,
                }))}
                placeholder="Select or Add New Material"
              />
            </div>

            <h3 className="mb-4 mt-6 font-bold text-lg">Requested Material</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mt-4">
                Quantity
              </label>
              <input
                type="number"
                value={requirement?.requestedQty || ""}
                onChange={(e) => handleEdit("requestedQty", e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mt-4">
                Unit: {requirement?.unit}
              </label>
              <select
                value={requirement?.unit || ""}
                onChange={(e) => handleEdit("unit", e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="">Select a Unit</option>
                {units.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
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
          </>
        ) : (
          <>
            {step === 0 && (
              <>
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
                    onChange={(e) => handleChange("site", e.target.value)}
                  >
                    <option>Select Site</option>
                    {sites.map((site, index) => (
                      <option key={index} value={site._id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="reqDate"
                    className="block text-sm font-semibold text-gray-600"
                  >
                    Required Date:{" "}
                    {moment(formData.reqDate).format("DD-MM-YYYY")}
                  </label>
                  <input
                    type="date"
                    value={formData.reqDate}
                    onChange={(e) => handleChange("reqDate", e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-gray-600"
                  >
                    Material Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select A Category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="requirementFor"
                    className="block text-sm font-semibold text-gray-600"
                  >
                    Requirement For:
                  </label>
                  <select
                    name="requirementFor"
                    value={formData.requirementFor}
                    onChange={(e) =>
                      handleChange("requirementFor", e.target.value)
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option>Requirement For</option>
                    {orderFor?.map((work, index) => (
                      <option key={index} value={work.workDetail}>
                        {work.workDetail}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Add Requirement
                </button>
              </>
            )}

            {step > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mt-4">
                  Material
                </label>
                <CreatableSelect
                  value={{
                    value: formData.items[step - 1]?.itemId,
                    label: formData.items[step - 1]?.item,
                  }}
                  onChange={(selectedOption) =>
                    handleRequirementChange("item", selectedOption)
                  }
                  onCreateOption={(newValue) =>
                    handleRequirementChange("item-new", newValue)
                  }
                  options={materials.map((material) => ({
                    value: material._id,
                    label: material.name,
                  }))}
                  placeholder="Select or Add New Material"
                />

                <label className="block text-sm font-semibold text-gray-600 mt-4">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.items[step - 1]?.requestedQty || 0}
                  onChange={(e) =>
                    handleRequirementChange("requestedQty", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />

                <label className="block text-sm font-semibold text-gray-600 mt-4">
                  Unit
                </label>
                <select
                  value={formData.items[step - 1]?.unit || ""}
                  onChange={(e) =>
                    handleRequirementChange("unit", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                >
                  {units.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-5">
              {step > 0 && (
                <>
                  {/* Top: Previous + Next */}
                  <div className="flex flex-row justify-between gap-4 mb-4">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="bg-gray-500 text-white p-2 rounded w-full md:w-auto"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-blue-500 text-white p-2 rounded w-full md:w-auto"
                    >
                      Next
                    </button>
                  </div>

                  {/* Bottom: Submit + Reset */}
                  <div className="flex flex-row justify-end items-end gap-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white p-2 rounded w-full md:w-auto"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600 w-full md:w-auto"
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </form>
      <Toaster position="top-right" reverseOrder={false} />
      <Modal onClose={() => setCreateModal(false)} isOpen={createModal}>
        <CreateStock onClose={() => setCreateModal(false)} item={item} />
      </Modal>
    </div>
  );
};

export default CreatePurchaseRequest;
