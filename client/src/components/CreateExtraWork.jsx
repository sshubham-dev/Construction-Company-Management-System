import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";

axios.defaults.withCredentials = true;

const CreateExtraWork = ({ onClose, id, index }) => {
  const [formData, setFormData] = useState({
    extraFor: "",
    contractor: "",
    client: "",
    site: "",
    WorkDetail: [
      {
        work: "",
        rate: "",
        area: "",
        unit: "",
        amount: "",
      },
    ],
  });
  const extraFor = ["Client", "Contractor"];
  const [sites, setSite] = useState([]);
  const [client, setClient] = useState({});
  const [contractors, setContractor] = useState([]);
  const units = ["SQFT", "RFT", "LUMSUM", "NOS", "FIXED", "RMT", "SQMT", "CUM"];
  const [workToEdit, setWorkToEdit] = useState(null);
  const [workData, setWorkData] = useState({
    work: "",
    rate: "",
    area: "",
    unit: "",
    amount: "",
  });
  const [detailToEdit, setDetailToEdit] = useState({
    id: "",
    index: "",
  });
  const [data, setData] = useState({
    site: "",
    contractor: "",
    client: "",
  });
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await axios.get("/api/v1/site");
        if (
          user?.department === "Site Incharge" ||
          user?.department === "Site Supervisor"
        ) {
          const existingSites = user?.site;
          console.log(response.data, existingSites);
          let SitesData = [];
          for (let site of response.data) {
            if (
              existingSites?.some(
                (existingSite) => existingSite.id === site._id
              )
            ) {
              SitesData.push(site);
            }
          }
          setSite(SitesData);
          console.log(SitesData);
        } else {
          setSite(response.data);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchSite();
  }, []);

  console.log(id, index);
  useEffect(() => {
    if (id && index !== undefined) {
      fetchWorkDetail(id, index);
      setDetailToEdit({ id, index });
    } else if (id) {
      fetchExtraWork(id);
      setWorkToEdit(id);
    }
  }, [id, index]);

  useEffect(() => {
    const siteId = formData.site;

    if (!siteId || sites.length === 0) return;

    const siteData = sites.find((site) => site._id === siteId);
    if (!siteData) return;

    const fetchContractorAndClient = async () => {
      try {
        const contractorIds = siteData.contractor;
        const clientId = siteData.client;

        // Fetch all contractors
        const contractorRes = await axios.get("/api/v1/contractor");
        const allContractors = contractorRes.data;

        let matchedContractors = [];
        if (Array.isArray(contractorIds)) {
          if (typeof contractorIds[0] === "object" && contractorIds[0]?.id) {
            matchedContractors = allContractors.filter((c) =>
              contractorIds.some((s) => s.id === c._id)
            );
          } else {
            matchedContractors = allContractors.filter((c) =>
              contractorIds.includes(c._id)
            );
          }
        }

        setContractor(matchedContractors);
        console.log("Client ID from siteData:", clientId);

        // Fetch all clients
        const clientRes = await axios.get("/api/v1/client");
        console.log(clientRes.data);
        const allClients = clientRes.data;

        const matchedClient = allClients.find((c) => c._id === clientId.id);
        setClient(matchedClient || "");
        console.log("Fetched client:", matchedClient);
      } catch (error) {
        console.error("Error fetching contractor or client:", error.message);
        toast.error("Failed to fetch contractor or client");
      }
    };

    fetchContractorAndClient();
  }, [formData.site, sites]);

  formData.client = client.name;

  const fetchExtraWork = async (id) => {
    try {
      const response = await axios.get(`/api/v1/extra-work/${id}`);
      console.log(response.data);
      setFormData({
        extraFor: response.data.extraFor,
        contractor: response.data.contractor?.id._id,
        client: response.data.client?.name,
        site: response.data.site?.id._id,
        WorkDetail: [
          {
            work: "",
            rate: "",
            area: "",
            unit: "",
            amount: "",
          },
        ],
      });
    } catch (error) {
      console.error("Error getting extra work:", error.message);
      toast.error(error.message);
    }
  };

  const fetchWorkDetail = async (id, index) => {
    try {
      const response = await axios.get(`/api/v1/extra-work/${id}/work`);
      const detail = response.data[index];
      console.log(response.data[index]);
      setWorkData({
        work: detail?.work,
        rate: detail?.rate,
        area: detail?.area,
        unit: detail?.unit,
        amount: detail?.amount,
      });
    } catch (error) {
      console.error("Error getting work details:", error.message);
      toast.error(error.message);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleAddWork = () => {
    setFormData({
      ...formData,
      WorkDetail: [
        ...formData.WorkDetail,
        {
          work: "",
          rate: "",
          area: "",
          unit: "",
          amount: "",
        },
      ],
    });
  };

  const handleUpdate = (field, value) => {
    setWorkData({
      ...workData,
      [field]: value,
    });
  };

  const handleRemoveWork = (index) => {
    const updatedWork = [...formData.WorkDetail];
    updatedWork.splice(index, 1);
    setFormData({
      ...formData,
      WorkDetail: updatedWork,
    });
  };

  const handleWorkChange = (index, field, value) => {
    const updatedWork = [...formData.WorkDetail];
    updatedWork[index][field] = value;
    setFormData({
      ...formData,
      WorkDetail: updatedWork,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updatedFormData = {
      ...formData,
      WorkDetail: formData.WorkDetail.map((detail) => {
        const amount = parseFloat(detail.area) * parseFloat(detail.rate);
        return {
          ...detail,
          amount: isNaN(amount) ? "" : amount.toFixed(1),
        };
      }),
    };

    const amount = parseFloat(workData.area) * parseFloat(workData.rate);
    const updatedDetail = {
      ...workData,
      amount: isNaN(amount) ? "" : amount.toFixed(1),
    };

    try {
      if (workToEdit) {
        console.log(updatedFormData);
        const response = await axios.put(
          `/api/v1/extra-work/${workToEdit}`,
          updatedFormData
        );
        toast.success(response.data.message);
        onClose();
        dispatch(fetchNotifications(user._id));
      } else if (detailToEdit.id !== "" && detailToEdit.index !== undefined) {
        const response = await axios.put(
          `/api/v1/extra-work/${detailToEdit.id}/work/${detailToEdit.index}`,
          updatedDetail
        );
        toast.success(response.data.message);
        onClose();
        dispatch(fetchNotifications(user._id));
      } else {
        console.log("updatedFormData:", updatedFormData);
        const response = await axios.post(
          "/api/v1/extra-work",
          updatedFormData
        );
        console.log(response.data);
        toast.success(response.data.message);
        onClose();
        dispatch(fetchNotifications(user._id));
      }
    } catch (error) {
      console.error("Error submitting extra work:", error.message);
      toast.error(error.message);
    }
  };

  const ExtraWorkFor = (name) => {
    switch (name) {
      case "Contractor":
        return (
          <>
            <label
              htmlFor="contractorName"
              className="block text-sm font-semibold text-gray-600"
            >
              Contractor
            </label>
            <select
              type="text"
              id="contractor"
              name="contractor"
              value={formData.contractor}
              onChange={(e) => handleChange("contractor", e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option>Contractor</option>
              {contractors &&
                contractors?.map((contractor, index) => (
                  <option key={index} value={contractor._id}>
                    {contractor.name}
                  </option>
                ))}
            </select>
          </>
        );
        break;
      case "Client":
        return (
          <>
            {client?.name ? (
              <>
                <label
                  htmlFor="client"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Client
                </label>
                <input
                  value={client.name}
                  readOnly
                  className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
                />
              </>
            ) : (
              <p className="text-sm text-red-500">
                Client not found or not loaded
              </p>
            )}
          </>
        );
        break;
      default:
        return <p>Please Select, For Whom You Wan't to Make Extra Work </p>;
        break;
    }
  };

  if (detailToEdit.id && detailToEdit.index !== undefined) {
    return (
      <div>
        <form
          onSubmit={handleSubmit}
          className="px-2 pt-2 pb-8 mb-4 w-full max-w-xl mx-auto"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Work:
            </label>
            <input
              value={workData.work}
              placeholder="Enter Work"
              onChange={(e) => handleUpdate("workDetail", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="userMail"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Area:
            </label>
            <input
              type="number"
              value={workData.area}
              name="area"
              onChange={(e) => handleUpdate("area", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="rate"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Quantity:
            </label>
            <input
              type="number"
              value={workData.rate}
              name="rate"
              onChange={(e) => handleUpdate("rate", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="unit"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Unit:
            </label>
            <select
              type="text"
              name="unit"
              value={workData.unit}
              onChange={(e) => handleUpdate("unit", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option>{workData ? workData.unit : "Select a Unit"}</option>
              {units.map((unit, index) => (
                <option key={index} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="amount"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Amount
            </label>
            <input
              type="text"
              value={workData.amount}
              onChange={(e) => handleUpdate("amount", e.target.value)}
              name="amount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Create Extra Work"}
          </button>
        </form>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );
  } else {
    return (
      <div>
        <form className="max-w-xl mx-auto bg-white" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="extraFor"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Extra Work for
            </label>
            <select
              name="extraFor"
              value={formData.extraFor}
              onChange={(e) => handleChange("extraFor", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option>Extra Work for</option>
              {extraFor.map((extra, index) => (
                <option key={index} value={extra}>
                  {extra}
                </option>
              ))}
            </select>
          </div>

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
              className="mt-1 p-2 w-full border rounded-md"
              onChange={(e) => handleChange("site", e.target.value)}
            >
              <option>Site</option>
              {sites.map((site, index) => (
                <option key={index} value={site._id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">{ExtraWorkFor(formData.extraFor)}</div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Work Details</h2>

            {formData.WorkDetail.map((workItem, index) => (
              <div key={index} className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`work[${index}].workDetail`}
                      className="block text-sm font-semibold text-gray-600"
                    >
                      Work Detail
                    </label>
                    <input
                      value={workItem.work}
                      placeholder="Enter Work"
                      onChange={(e) =>
                        handleWorkChange(index, "work", e.target.value)
                      }
                      className="border p-2 rounded w-full"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`work[${index}].rate`}
                      className="block text-sm font-semibold text-gray-600"
                    >
                      Rate
                    </label>
                    <input
                      type="number"
                      value={workItem.rate}
                      onChange={(e) =>
                        handleWorkChange(index, "rate", e.target.value)
                      }
                      placeholder="Rate"
                      className="border p-2 rounded w-full"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`work[${index}].area`}
                      className="block text-sm font-semibold text-gray-600"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={workItem.area}
                      onChange={(e) =>
                        handleWorkChange(index, "area", e.target.value)
                      }
                      placeholder="Area"
                      className="border p-2 rounded w-full"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`work[${index}].unit`}
                      className="block text-sm font-semibold text-gray-600"
                    >
                      Unit
                    </label>
                    <select
                      value={workItem.unit}
                      onChange={(e) =>
                        handleWorkChange(index, "unit", e.target.value)
                      }
                      className="border p-2 rounded w-full"
                    >
                      <option>Select a Unit</option>
                      {units.map((unit, index) => (
                        <option key={index} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.WorkDetail.length > 1 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => handleRemoveWork(index)}
                        className="bg-red-500 text-white p-2 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {workToEdit ? (
              ""
            ) : (
              <button
                type="button"
                onClick={handleAddWork}
                className="bg-blue-500 text-white p-2 rounded"
              >
                More Work
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded mt-4"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Create Extra Work"}
            </button>
          </div>
        </form>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );
  }
};

export default CreateExtraWork;
