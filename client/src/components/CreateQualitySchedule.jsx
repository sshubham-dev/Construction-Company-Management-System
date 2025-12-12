import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";
import moment from "moment";

axios.defaults.withCredentials = true;

const CreateQualitySchedule = ({ onClose, id, index }) => {
  const [formData, setFormData] = useState({
    site: "",
    // qualityScheduleId: "",
    workDetails: [
      {
        work: "",
        checkingDate: "",
      },
    ],
  });
  const [workDetails, setWorkDetails] = useState([]);
  const [data, setData] = useState("");
  const [sites, setSite] = useState([]);
  const [scheduleFor, setScheduleFor] = useState([]);
  const [scheduleIdToEdit, setScheduleIdToEdit] = useState(null);
  const [workToEdit, setWorkToEdit] = useState({ id: "", index: "" });
  const [workDetail, setWorkDetail] = useState({
    work: "",
    checkingDate: "",
    checkedAt: "",
    difference: "",
    reason: "",
    status: "",
  });
  const { user } = useSelector((state) => state.auth);
  const statusOptions = [
    "Started",
    "Completed",
    "Pending",
    "Partially Completed",
  ];
  const [loading, setLoading] = useState(false);
  const [showCustomWork, setShowCustomWork] = useState(false);
  const [customWork, setCustomWork] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    // const fetchWork = async () => {
    //   try {
    //     const title = "Quality Schedule";
    //     const workData = await axios.post("/api/v1/work-details/name", {
    //       title,
    //     });
    //     console.log(workData);
    //     setWorkDetails(workData.data.description);
    //   } catch (error) {
    //     console.log("Error fetching work details:", error.message);
    //     toast.error(error.message);
    //   }
    // };
    // fetchWork();
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

  useEffect(() => {
    if (id && index !== undefined) {
      fetchScheduleDetail(id, index);
      setWorkToEdit({ id, index });
    } else if (id) {
      fetchQualitySchedule(id);
      setScheduleIdToEdit(id);
    }
  }, [id, index]);

  const fetchScheduleDetail = async (id, index) => {
    try {
      const response = await axios.get(
        `/api/v1/quality-schedule/${id}/workDetails`
      );
      const detail = response.data[index];
      // console.log('response.data', response.data[index])
      setWorkDetail({
        work: detail.work,
        checkingDate: detail.checkingDate,
        checkedAt: detail.checkedAt,
        difference: detail.difference,
        reason: detail.reason,
        status: detail.status,
      });
    } catch (error) {
      console.log("Error fetching work details:", error);
    }
  };

  const fetchQualitySchedule = async (id) => {
    try {
      const response = await axios.get(`/api/v1/quality-schedule/${id}`);
      const data = response.data;
      setData(data?.site.name);
      setFormData({
        site: data?.site.id,
        // qualityScheduleId: data?.qualityScheduleId,
        workDetails: [{ work: "", checkingDate: "" }],
      });
    } catch (error) {
      console.log("Error fetching project schedule:", error);
    }
  };

  useEffect(() => {
    const selectedSite = sites.filter((site) => site._id === formData.site)[0];
    // console.log(selectedSite);
    console.log(selectedSite?.projectSchedule?.projectDetail);
    setScheduleFor(
      Array.isArray(selectedSite?.projectSchedule?.projectDetail)
        ? selectedSite.projectSchedule.projectDetail
        : []
    );
    // setWorkDetails(selectedSite?.projectSchedule?.projectDetail);
    const fetchProjectSchedule = async () => {
      try {
        const projectScheduleData = await axios.get(`/api/v1/project-schedule`);
        // console.log(projectScheduleData.data);
        const filteredProjectSchedules = projectScheduleData.data.filter(
          (projectSchedule) => projectSchedule.site?.id._id === formData.site
        )[0];
        const filteredProjectDetail =
          filteredProjectSchedules?.projectDetail.filter(
            (detail) =>
              detail?.status?.toLowerCase() !== "completed" &&
              detail?.status?.toLowerCase() !== "pending"
          );

        // console.log(filteredProjectSchedules);
        console.log(filteredProjectDetail);
        setScheduleFor(
          Array.isArray(filteredProjectDetail) ? filteredProjectDetail : []
        );
        // setWorkDetails(filteredProjectDetail);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjectSchedule();
  }, [formData.site]);

  const handleChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleUpdate = (field, value) => {
    setWorkDetail((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleAddWork = () => {
    setFormData((prevState) => ({
      ...prevState,
      workDetails: [...prevState.workDetails, { work: "", checkingDate: "" }],
    }));
  };

  const handleRemoveWork = (index) => {
    const updatedWork = [...formData.workDetails];
    updatedWork.splice(index, 1);
    setFormData((prevState) => ({
      ...prevState,
      workDetails: updatedWork,
    }));
  };

  const handleWorkChange = (index, field, value) => {
    const updatedWork = [...formData.workDetails];
    updatedWork[index][field] = value;
    setFormData((prevState) => ({
      ...prevState,
      workDetails: updatedWork,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(formData);
    try {
      if (scheduleIdToEdit) {
        console.log(formData);
        const response = await axios.put(
          `/api/v1/quality-schedule/${scheduleIdToEdit}`,
          formData
        );
        toast.success(response.data.message);
        onClose();
        dispatch(fetchNotifications(user._id));
      } else if (workToEdit.id && workToEdit.index !== undefined) {
        await axios.put(
          `/api/v1/quality-schedule/${workToEdit.id}/workDetails/${workToEdit.index}`,
          workDetail
        );
        toast.success("Edited successfully");
        onClose();
        dispatch(fetchNotifications(user._id));
      } else {
        const response = await axios.post("/api/v1/quality-schedule", formData);
        toast.success(response.data.message);
        onClose();
        dispatch(fetchNotifications(user._id));
      }
    } catch (error) {
      console.log("Error submitting quality schedule:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {workToEdit.id && workToEdit.index !== undefined ? (
          <>
            <div className="mb-4">
              <label
                htmlFor="work"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Work:
              </label>
              <Select
                value={
                  workDetail.work
                    ? { value: workDetail.work, label: workDetail.work }
                    : null
                }
                onChange={(selectedOption) => {
                  if (selectedOption.value === "other") {
                    setShowCustomWork(true);
                    handleUpdate("work", "");
                  } else {
                    setShowCustomWork(false);
                    handleUpdate("work", selectedOption.value);
                  }
                }}
                options={[
                  ...workDetails.map((w) => ({
                    value: w.work,
                    label: w.work,
                  })),
                  { value: "other", label: "Other" },
                ]}
                placeholder={workDetail.work || "Select Work Detail"}
              />

              {showCustomWork && (
                <input
                  type="text"
                  placeholder="Enter new work detail"
                  value={customWork}
                  onChange={(e) => {
                    setCustomWork(e.target.value);
                    handleUpdate("work", e.target.value);
                  }}
                  className="mt-2 border p-2 rounded w-full"
                />
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="checkingDate"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Checking Date:{" "}
                {moment(workDetail?.checkingDate).format("DD MMMM YYYY")}
              </label>
              <input
                type="date"
                name="checkingDate"
                value={workDetail.checkingDate}
                onChange={(e) => handleUpdate("checkingDate", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="checkedAt"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Actual Checked At:{" "}
                {workDetail?.checkedAt
                  ? moment(workDetail?.checkedAt).format("DD MMMM YYYY")
                  : ""}
              </label>
              <input
                type="date"
                name="checkedAt"
                value={workDetail.checkedAt}
                onChange={(e) => handleUpdate("checkedAt", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="difference"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Difference:
              </label>
              <input
                type="text"
                name="difference"
                value={workDetail.difference}
                onChange={(e) => handleUpdate("difference", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="reason"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Reason:
              </label>
              <input
                type="text"
                name="reason"
                value={workDetail.reason}
                onChange={(e) => handleUpdate("reason", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Status:
              </label>
              <select
                value={workDetail.status}
                onChange={(e) => handleUpdate("status", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option>{workDetail.status || "Select Status"}</option>
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
            <div className="mb-4">
              <label
                htmlFor="site"
                className="block text-sm font-semibold text-gray-600"
              >
                Site:
              </label>
              <select
                name="site"
                value={formData.site}
                className="mt-1 p-2 w-full border rounded-md"
                onChange={(e) => handleChange("site", e.target.value)}
              >
                <option>{scheduleIdToEdit ? data : "Select Site"}</option>
                {sites.map((site, index) => (
                  <option key={index} value={site._id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Work Details</h2>
              {formData.workDetails.map((workItem, index) => (
                <div key={index} className="mb-4 ">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600">
                        Work to Check:
                      </label>
                      <Select
                        value={
                          workItem.work
                            ? { value: workItem.work, label: workItem.work }
                            : null
                        }
                        onChange={(selectedOption) => {
                          const isOther =
                            selectedOption.value.toLowerCase() === "other";
                          const updatedWorkDetails = [...formData.workDetails];
                          updatedWorkDetails[index].isOther = isOther;
                          updatedWorkDetails[index].work = isOther
                            ? ""
                            : selectedOption.value;
                          setFormData({
                            ...formData,
                            workDetails: updatedWorkDetails,
                          });
                        }}
                        options={[
                          ...(Array.isArray(scheduleFor) ? scheduleFor : []).map((work) => ({
                            value: work.workDetail,
                            label: work.workDetail,
                          })),
                          { value: "other", label: "Other" },
                        ]}
                        placeholder="Select Work Detail"
                      />

                      {formData.workDetails[index].isOther && (
                        <input
                          type="text"
                          placeholder="Enter new work detail"
                          value={workItem.work}
                          onChange={(e) =>
                            handleWorkChange(index, "work", e.target.value)
                          }
                          className="mt-2 border p-2 rounded w-full"
                        />
                      )}
                    </div>

                    {/* <div>
                      <label className="block text-sm font-semibold text-gray-600">
                        Work to Check:
                      </label>
                      <Select
                        value={
                          workItem.work
                            ? { value: workItem.work, label: workItem.work }
                            : null
                        }
                        onChange={(selectedOption) => {
                          const isOther =
                            selectedOption.value.toLowerCase() === "other";
                          const updatedWorkDetails = [...formData.workDetails];
                          updatedWorkDetails[index].isOther = isOther;
                          updatedWorkDetails[index].work = isOther
                            ? ""
                            : selectedOption.value;
                          setFormData({
                            ...formData,
                            workDetails: updatedWorkDetails,
                          });
                        }}
                        options={[
                          ...workDetails.map((workDetail) => ({
                            value: workDetail.work,
                            label: workDetail.work,
                          })),
                          { value: "other", label: "Other" },
                        ]}
                        placeholder="Select Work Detail"
                      />

                      {formData.workDetails[index].isOther && (
                        <input
                          type="text"
                          placeholder="Enter new work detail"
                          value={workItem.work}
                          onChange={(e) =>
                            handleWorkChange(index, "work", e.target.value)
                          }
                          className="mt-2 border p-2 rounded w-full"
                        />
                      )}
                    </div> */}

                    <div>
                      <label
                        htmlFor={`work[${index}].checkingDate`}
                        className="block text-sm font-semibold text-gray-600"
                      >
                        Checking Date:
                      </label>
                      <input
                        type="date"
                        value={workItem.checkingDate}
                        onChange={(e) =>
                          handleWorkChange(
                            index,
                            "checkingDate",
                            e.target.value
                          )
                        }
                        className="border p-2 rounded w-full"
                      />
                    </div>

                    {formData.workDetails.length > 1 && (
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
              {scheduleIdToEdit ? null : (
                <button
                  type="button"
                  onClick={handleAddWork}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  More
                </button>
              )}
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded mt-4"
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : `${scheduleIdToEdit ? "Update" : "Create"}`}
              </button>
            </div>
          </>
        )}
      </form>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CreateQualitySchedule;
