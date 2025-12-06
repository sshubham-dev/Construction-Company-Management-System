import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";
import Select from "react-select";
import moment from "moment";

axios.defaults.withCredentials = true;

const CreatePaymentSchedule = ({ onClose, id, index }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    site: "",
    client: "",
    paymentDetails: [
      {
        workDescription: "",
        amount: "",
        dueDate: "",
      },
    ],
  });
  const [paymentDetail, setPaymentDetail] = useState({
    workDescription: "",
    amount: "",
    paymentDate: "",
    status: "",
    dueDate: "",
  });
  const [scheduleIdToEdit, setScheduleIdToEdit] = useState(null);
  const [paymentToEdit, setPaymentToEdit] = useState({ id: "", index: "" });
  const [client, setClient] = useState({});
  const [workDetails, setWorkDetails] = useState([]);
  const [sites, setSite] = useState([]);
  const [data, setData] = useState({ site: "" });
  const { user } = useSelector((state) => state.auth);
  const statusOptions = ["Paid", "Pending", "Partially Paid"];
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState({ name: "", id: "" });
  const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   const fetchClients = async () => {
  //     try {
  //       const response = await axios.get('/api/v1/clients'); // Adjust the endpoint as necessary
  //       setClients(response.data);
  //     } catch (error) {
  //       console.error('Error fetching clients:', error.message);
  //     }
  //   };

  //   fetchClients();
  // }, []);

  useEffect(() => {
    const siteId = formData.site;
    let siteData = [];
    if (siteId) {
      siteData = sites.filter((site) => site._id === siteId);
    }

    setClient(siteData[0]?.client || "");
  }, [formData.site]);
  formData.client = client.name;

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await axios.get("/api/v1/site");
        if (
          user.department === "Site Incharge" ||
          user.department === "Site Supervisor"
        ) {
          const existingSites = user?.site;
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
          // console.log(SitesData)
        } else {
          setSite(response.data);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    const fetchWorkDetails = async () => {
      try {
        const title = "Payment Schedule";
        const workData = await axios.post("/api/v1/work-details/name", {
          title,
        });
        setWorkDetails(workData.data.description);
      } catch (error) {
        console.log("Error fetching work details:", error.message);
      }
    };

    fetchSite();
    fetchWorkDetails();

    if (id && index !== undefined) {
      fetchPaymentDetail(id, index);
      setPaymentToEdit({ id, index });
    } else if (id) {
      fetchPaymentSchedule(id);
      setScheduleIdToEdit(id);
    }
  }, [id, index, user]);

  const fetchPaymentDetail = async (id, index) => {
    try {
      const response = await axios.get(
        `/api/v1/payment-schedule/${id}/paymentDetails`
      );
      const detail = response.data[index];
      setPaymentDetail({
        workDescription: detail?.workDescription,
        amount: detail?.amount,
        paymentDate: detail?.paymentDate,
        dueDate: detail?.dueDate,
        status: detail?.status,
      });
    } catch (error) {
      console.log("Error fetching Payment Detail:", error);
    }
  };

  const fetchPaymentSchedule = async (id) => {
    try {
      const response = await axios.get(`/api/v1/payment-schedule/${id}`);
      const payment = response.data;
      setData({ site: payment.site?.name });
      setFormData({
        site: {
          name: payment.site?.name,
          id: payment.site?.id,
        },
        client: {
          name: payment.client?.name,
          id: payment.client?.id,
        },
        paymentDetails: [{ workDescription: "", amount: "", paymentDate: "" }],
      });
    } catch (error) {
      console.log("Error fetching Payment Schedule:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: {
        ...prevState[field],
        ...value,
      },
    }));
  };

  const handleSiteChange = async (siteId) => {
    setFormData((prevState) => ({
      ...prevState,
      site: siteId,
    }));

    try {
      const response = await axios.get(`/api/v1/clients?siteId=${siteId}`);
      setClients(response.data);
      if (response.data.length > 0) {
        setSelectedClient({
          id: response.data[0]._id,
          name: response.data[0].name,
        });
        handleChange("client", {
          id: response.data[0]._id,
          name: response.data[0].name,
        });
      } else {
        setSelectedClient({ id: "", name: "" });
      }
    } catch (error) {
      console.error("Error fetching clients:", error.message);
    }
  };

  const handleNext = () => {
    if (step < formData.paymentDetails.length) {
      setStep(step + 1);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        paymentDetails: [
          ...prevState.paymentDetails,
          { workDescription: "", amount: "", paymentDate: "" },
        ],
      }));
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleWorkChange = (field, value) => {
    setFormData((prevState) => {
      const updatedPaymentDetails = [...prevState.paymentDetails];
      updatedPaymentDetails[step - 1] = {
        ...updatedPaymentDetails[step - 1],
        [field]: value,
      };
      return { ...prevState, paymentDetails: updatedPaymentDetails };
    });
  };

  const handleReset = () => {
    setFormData({
      site: "",
      client: "",
      paymentDetails: [{ workDescription: "", amount: "", paymentDate: "" }],
    });
    setStep(0);
  };

  const handleUpdate = (field, value) => {
    setPaymentDetail((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(formData);
    try {
      if (scheduleIdToEdit) {
        const response = await axios.put(
          `/api/v1/payment-schedule/${scheduleIdToEdit}`,
          formData
        );
        toast.success(response.data.message);
        onClose();
        dispatch(fetchNotifications(user._id));
      } else if (paymentToEdit.id && paymentToEdit.index !== undefined) {
        const response = await axios.put(
          `/api/v1/payment-schedule/${paymentToEdit.id}/paymentDetails/${paymentToEdit.index}`,
          paymentDetail
        );
        toast.success(response.data.message);
        onClose();
        dispatch(fetchNotifications(user._id));
      } else {
        const response = await axios.post("/api/v1/payment-schedule", formData);
        toast.success(response.data.message);
        onClose();
        dispatch(fetchNotifications(user._id));
      }
    } catch (error) {
      console.log("Error submitting payment schedule:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 w-full max-w-md">
        {paymentToEdit.id && paymentToEdit.index !== undefined ? (
          <>
            <div className="mb-4">
              <label
                htmlFor="workDescription"
                className="block text-sm font-semibold text-gray-600"
              >
                Work Detail
              </label>
              <Select
                value={{
                  value: paymentDetail.workDescription,
                  label: paymentDetail.workDescription,
                }}
                onChange={(selectedOption) =>
                  handleUpdate("workDescription", selectedOption.value)
                }
                options={workDetails.map((workDetail) => ({
                  value: workDetail.work,
                  label: workDetail.work,
                }))}
                placeholder="Select Work Detail"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-gray-600"
              >
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={paymentDetail.amount}
                onChange={(e) => handleUpdate("amount", e.target.value)}
                placeholder="Amount"
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="paymentDate"
                className="block text-sm font-semibold text-gray-600"
              >
                Date of Payment:{" "}
                {moment(paymentDetail.paymentDate).format("DD MM YYYY")}
              </label>
              <input
                type="date"
                name="paymentDate"
                value={paymentDetail.paymentDate}
                onChange={(e) => handleUpdate("paymentDate", e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="dueDate"
                className="block text-sm font-semibold text-gray-600"
              >
                Date of Due:{" "}
                {moment(paymentDetail.dueDate).format("DD MM YYYY")}
              </label>
              <input
                type="date"
                name="dueDate"
                value={paymentDetail.dueDate}
                onChange={(e) => handleUpdate("dueDate", e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Status
              </label>
              <select
                value={paymentDetail.status}
                onChange={(e) => handleUpdate("status", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option>{paymentDetail.status || "Select Status"}</option>
                {statusOptions.map((status, index) => (
                  <option key={index} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </>
        ) : (
          <>
            {step === 0 && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="site"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Select a Site
                  </label>
                  <select
                    name="site"
                    value={formData.site.id}
                    onChange={(e) => handleSiteChange(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select Site</option>
                    {sites.map((site, index) => (
                      <option key={index} value={site._id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="client"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Client
                  </label>
                  <p className="block text-md font-medium text-gray-600">
                    {formData?.client || "No client selected"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Add Work
                </button>
              </>
            )}

            <div className="my-4">
              {step > 0 && (
                <div>
                  <label
                    htmlFor="workDescription"
                    className="block text-sm font-semibold text-gray-600 mt-3"
                  >
                    Work Detail
                  </label>
                  <Select
                    value={{
                      value: formData.paymentDetails[step - 1]?.workDescription,
                      label: formData.paymentDetails[step - 1]?.workDescription,
                    }}
                    onChange={(selectedOption) =>
                      handleWorkChange("workDescription", selectedOption.value)
                    }
                    options={workDetails.map((workDetail) => ({
                      value: workDetail.work,
                      label: workDetail.work,
                    }))}
                    placeholder="Select Work Detail"
                  />
                  <label
                    htmlFor="amount"
                    className="block text-sm font-semibold text-gray-600 mt-4"
                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.paymentDetails[step - 1]?.amount || ""}
                    onChange={(e) => handleWorkChange("amount", e.target.value)}
                    placeholder="Amount"
                    className="border p-2 rounded w-full"
                  />
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-semibold text-gray-600 mt-4"
                  >
                    Date of Due
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.paymentDetails[step - 1]?.dueDate || ""}
                    onChange={(e) =>
                      handleWorkChange("dueDate", e.target.value)
                    }
                    className="border p-2 rounded w-full"
                  />
                </div>
              )}
              <div className="mt-4">
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
            </div>
          </>
        )}
      </form>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CreatePaymentSchedule;
