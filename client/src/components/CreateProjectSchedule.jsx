import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";
import Select from "react-select";
import moment from "moment";

axios.defaults.withCredentials = true;

const CreateProjectSchedule = ({ onClose, id, index }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    site: "",
    projectDetail: [
      {
        workDetail: "",
        planned: "",
        rePlannedDates: [{ date: "", reason: "" }],
        actual: "",
        difference: "",
        reason: "",
        status: "Pending",
      },
    ],
  });
  const [newReplanReason, setNewReplanReason] = useState(false);
  const [newReplanDate, setNewReplanDate] = useState({ date: "", reason: "" });
  const [workDetails, setWorkDetails] = useState([]);
  const [data, setData] = useState("");
  const [sites, setSite] = useState([]);
  const [scheduleIdToEdit, setScheduleIdToEdit] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState({ id: "", index: "" });
  const { user } = useSelector((state) => state.auth);
  const statusOptions = [
    "Started",
    "Completed",
    "Pending",
    "Partially Completed",
  ];
  const [projectDetail, setProjectDetail] = useState({
    workDetail: "",
    planned: "",
    rePlannedDates: [{ date: "", reason: "" }],
    actual: "",
    difference: "",
    reason: "",
    status: "Pending",
  });
    const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (id && index !== undefined) {
      fetchProjectDetail(id, index);
      setProjectToEdit({ id, index });
    } else if (id) {
      setScheduleIdToEdit(id);
      fetchProjectSchedule(id);
    }
  }, [id, index]);
  const fetchProjectDetail = async (id, index) => {
    try {
      const response = await axios.get(
        `/api/v1/project-schedule/${id}/projectDetails`
      );
      const detail = response.data[index];
      console.log(response.data[index]);
      setProjectDetail((prevState) => ({
        ...prevState,
        workDetail: detail.workDetail,
        planned: detail.planned,
        rePlannedDates: detail.rePlannedDates,
        actual: detail.actual,
        difference: detail.difference,
        reason: detail.reason,
        status: detail.status,
      }));
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast.error("Failed to fetch project details.");
    }
  };
  const fetchProjectSchedule = async (id) => {
    try {
      const response = await axios.get(`/api/v1/project-schedule/${id}`);
      const project = response.data;
      setData(project?.site.name);
      setFormData({
        site: project?.site.id._id,
        // scheduleId: project?.scheduleId,
        projectDetail: [
          {
            workDetail: "",
            planned: "",
            rePlannedDates: "",
            actual: "",
            difference: "",
            reason: "",
            status: "Pending",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching project schedule:", error);
      toast.error("Failed to fetch project schedule.");
    }
  };

  useEffect(() => {
    const fetchWork = async () => {
            try {
        const title = "Project Schedule";
        const workData = await axios.post("/api/v1/work-details/name", {
          title,
        });
        console.log(workData);
        setWorkDetails(workData.data.description);
      } catch (error) {
        console.log("Error fetching work details:", error.message);
        toast.error(error.message);
      }
    };
    fetchWork();
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
  
  const handleChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };
  const handleEdit = (field, value) => {
    setProjectDetail((prev) => ({
      ...prev,
      [field]: value,
    }));
    const planned = new Date(projectDetail.planned);
    const actual = new Date(value);
    const diffDays = Math.ceil((actual - planned) / (1000 * 60 * 60 * 24));
    setProjectDetail((prev) => ({
      ...prev,
      actual: value,
      difference: diffDays,
    }));
  };
  const handleAddReplan = () => {
    if (!newReplanDate) {
      toast.error("Please select a replanned date");
      return;
    }

    // ensure rePlannedDates exists
    const updatedDetail = { ...projectDetail };
    // updatedDetail.rePlannedDates = updatedDetail.rePlannedDates || [];
    console.log(updatedDetail);
    // add the new replanned date
    updatedDetail.rePlannedDates.push({
      date: newReplanDate,
      reason: newReplanReason || "Replanned due to delay",
    });

    // update state
    setProjectDetail(updatedDetail);

    // clear temp fields
    setNewReplanDate("");
    setNewReplanReason("");
  };
  const handleUpdate = (field, value) => {
    setFormData((prevState) => {
      const updatedProjectDetail = [...prevState.projectDetail];
      if (!updatedProjectDetail[step - 1]) {
        updatedProjectDetail[step - 1] = {
          workDetail: "",
          planned: "",
          actual: "",
          difference: "",
          reason: "",
          status: "",
        };
      }
      updatedProjectDetail[step - 1][field] = value;
      return { ...prevState, projectDetail: updatedProjectDetail };
    });
  };
  const handleNext = (e) => {
    e.preventDefault();
    // if (!formData.projectDetail[step].workDetail) {
    //   toast.error("Please enter work detail before proceeding.");
    //   return;
    // }
    if (step < formData.projectDetail.length - 1) {
      setStep(step + 1);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        projectDetail: [
          ...prevState.projectDetail,
          {
            workDetail: "",
            planned: "",
            actual: "",
            difference: "",
            reason: "",
            status: "Pending",
          },
        ],
      }));
      setStep(step + 1);
    }
  };
  const handlePrevious = (e) => {
    e.preventDefault();
    if (step > 0) setStep(step - 1);
  };
  const handleReset = () => {
    setFormData({
      site: "",
      scheduleId: "",
      projectDetail: [
        {
          workDetail: "",
          planned: "",
          rePlannedDates: "",
          actual: "",
          difference: "",
          reason: "",
          status: "Pending",
        },
      ],
    });
    setStep(0);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(formData); // Log the form data before submission
    // formData.projectDetail = formData.projectDetail.filter(
    //   (detail) =>
    //     detail.completingStatus.toComplete || detail.startingStatus.toStart
    // );
    try {
      if (scheduleIdToEdit) {
        console.log(formData);
        const response = await axios.put(
          `/api/v1/project-schedule/${scheduleIdToEdit}`,
          formData
        );
        toast.success(response.data.message);
         setLoading(false)
         dispatch(fetchNotifications(user._id));
        onClose();
      } else if (projectToEdit.id !== "" && projectToEdit.index !== "") {
        console.log(projectDetail);
        const resposnse = await axios.put(
          `/api/v1/project-schedule/${projectToEdit.id}/projectDetails/${projectToEdit.index}`,
          projectDetail
        );
        toast.success("Edited successfully");
        console.log("first", resposnse.data?.updatedWork);
         setLoading(false)
         dispatch(fetchNotifications(user._id));
        onClose();
      } else {
        console.log("first", formData);
        const response = await axios.post("/api/v1/project-schedule", formData);
        toast.success(response.data.message);
        setLoading(false)
        onClose();
        dispatch(fetchNotifications(user._id));
      }
    } catch (error) {
      setLoading(false)
      console.error("Error submitting project schedule:", error);
      toast.error("Failed to submit project schedule.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 w-full max-w-md">
        {projectToEdit.index !== undefined && projectToEdit.id ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Work:
              </label>
              <Select
                onChange={(selectedOption) =>
                  handleEdit("workDetail", selectedOption.value)
                }
                options={workDetails.map((workDetail) => ({
                  value: workDetail.work,
                  label: workDetail.work,
                }))}
                placeholder={projectDetail?.workDetail || "Select Work Detail:"}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Status:
              </label>
              <select
                onChange={(e) => handleEdit("status", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={projectDetail?.status || ""}
              >
                <option value="">Select Status</option>
                {statusOptions.map((status, i) => (
                  <option key={i} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="mb-4 mt-6 font-bold text-lg">
              Work Starting Status
            </h3>

            {/* Planned Date Display */}
            <div className="mb-4">
              <p>
                Planned:{" "}
                {projectDetail?.planned
                  ? new Date(projectDetail.planned).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            {/* --- REPLANNED DATES SECTION --- */}
            <div className="mb-8">
              <h4 className="font-medium mb-2">Replanned Dates</h4>

              {/* Display existing replanned dates */}
              {projectDetail.rePlannedDates &&
              projectDetail.rePlannedDates.length > 0 ? (
                <ul className="list-disc pl-5 mb-3">
                  {projectDetail.rePlannedDates.map((r, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      <span className="font-semibold">{moment(r.date).format("DD-MM-YYYY")}</span> —{" "}
                      {r.reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 mb-3">
                  No replanned dates yet.
                </p>
              )}

              {/* Add new replanned date inputs */}
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  placeholder="New replanned date"
                  className="border rounded px-3 py-1"
                  value={newReplanDate || ""}
                  onChange={(e) => setNewReplanDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Reason for change"
                  className="border rounded px-3 py-1"
                  value={newReplanReason || ""}
                  onChange={(e) => setNewReplanReason(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleAddReplan(projectToEdit?.index)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Add Replanned Date
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Difference:
              </label>
              <input
                type="text"
                name="difference"
                value={projectDetail?.difference || ""}
                onChange={(e) => handleEdit("difference", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Reason:
              </label>
              <input
                type="text"
                name="reason"
                value={projectDetail?.reason || ""}
                onChange={(e) => handleEdit("reason", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {projectDetail.status === "Completed" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Actual Date:
                </label>
                <input
                  type="date"
                  name="actual"
                  value={projectDetail?.actual || ""}
                  onChange={(e) => handleEdit("actual", e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handleReset}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
                    className="block text-sm font-medium text-gray-600"
                  >
                    Select a Site
                  </label>
                  <select
                    name="site"
                    value={formData.site}
                    onChange={(e) => handleChange("site", e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option>{scheduleIdToEdit ? data.site : "Site"}</option>
                    {sites.map((site, index) => (
                      <option key={index} value={site._id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div className="mb-4">
                  <label
                    htmlFor="scheduleId"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Schedule Id:
                  </label>
                  <input
                    type="text"
                    name="scheduleId"
                    value={formData.scheduleId}
                    onChange={(e) =>
                      handleChange("scheduleId", e.target.value)
                    }
                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
                    required
                  />
                </div> */}
                <button
                  type="button"
                  disabled={formData.site === "" || formData.scheduleId === ""}
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
                  <div className="mb-4">
                    <label
                      htmlFor="workDetail"
                      className="block text-sm font-medium text-gray-600"
                    >
                      Work Details
                    </label>
                    <Select
                      onChange={(selectedOption) =>
                        handleUpdate("workDetail", selectedOption.value)
                      }
                      options={workDetails.map((workDetail) => ({
                        value: workDetail.work,
                        label: workDetail.work,
                      }))}
                      placeholder={
                        formData.projectDetail[step - 1]?.workDetail ||
                        "Select Work Detail:"
                      }
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="planned"
                      className="block text-sm font-medium text-gray-600"
                    >
                      Planned Date
                    </label>
                    <input
                      type="date"
                      name="planned"
                      value={formData.projectDetail[step - 1]?.planned || ""}
                      onChange={(e) => handleUpdate("planned", e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
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
                        Back
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

export default CreateProjectSchedule;

const AddReplannedDate = ({ projectDetail, setProjectDetail }) => {
  const [showReplan, setShowReplan] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");

  const handleAddReplan = () => {
    if (!newDate) {
      alert("Please select a date");
      return;
    }

    const updated = { ...projectDetail };
    updated.rePlannedDates = updated.rePlannedDates || [];
    updated.rePlannedDates.push({
      date: newDate,
      reason: reason || "Replanned due to delay",
    });

    setProjectDetail(updated);
    setShowReplan(false);
    setNewDate("");
    setReason("");
  };

  return (
    <>
      {!showReplan ? (
        <button
          type="button"
          onClick={() => setShowReplan(true)}
          className="mt-3 bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
        >
          Add Replanned Date
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <input
            type="date"
            className="border rounded-lg px-3 py-1 w-full"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Reason for change"
            className="border rounded-lg px-3 py-1 w-full"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleAddReplan}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReplan(false);
                setNewDate("");
                setReason("");
              }}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
