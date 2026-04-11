import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import "./screen.css";
import { GrEdit } from "react-icons/gr";
import { FaExternalLinkAlt } from "react-icons/fa";
import { MdAdd, MdDownload, MdDelete } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import { Tabs } from "antd";
import moment from "moment";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import Modal from "../components/Modal";
import CreatePaymentSchedule from "../components/CreatePaymentSchedule";
import CreateSite from "../components/CreateSite";

axios.defaults.withCredentials = true;

const SiteScreen = () => {
  const [site, setSiteData] = useState({});
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [projectDetail, setProjectDetail] = useState([]);
  const [workOrders, setWorkOrder] = useState([]);
  const { id } = useParams();
  const [paymentSchedules, setpaymentSchedules] = useState({});
  const [supplierBills, setSupplierBill] = useState([]);
  const [contractorBills, setContractorBill] = useState([]);
  const [contractorExtra, setContractorExtra] = useState([]);
  const [clientExtra, setClientExtra] = useState({});
  const [purchaseOrders, setPurchaseOrder] = useState([]);
  const [qualitySchedules, setQualitySchedule] = useState([]);
  const [paymentModal, setPaymentModal] = useState(false);
  const [projectModal, setProjectModal] = useState(false);
  const [workModal, setWorkModal] = useState(false);
  const [billModal, setBillModal] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [extraModal, setExtraModal] = useState(false);
  const [qualityModal, setQualityModal] = useState(false);
  const [purchaseRequests, setPurchaseRequest] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  // console.log(id)
  useEffect(() => {
    if (id) {
      const fetchSiteDetails = async () => {
        try {
          const response = await axios.get(`/api/v1/site/${id}`);
          const site = response.data;
          // console.log(site)
          setSiteData(site);
          // fetch project schedule seprately
          setProjectDetail(site.projectSchedule?.projectDetail);
        } catch (error) {
          console.log("Error fetching site details:", error);
        }
      };
      fetchSiteDetails();
      fetchPaymentSchedules(id);
      fetchBill(id);
      fetchQualitySchedules(id);
      fetchWorkOrder(id);
      fetchExtraWork(id);
      fetchPurchaseRequest(id);
    }
  }, [id]);

  const fetchQualitySchedules = async (id) => {
    try {
      const qualitySchedulesData = await axios.get(
        `/api/v1/quality-schedule/site/${id}`,
      );
      setQualitySchedule(...qualitySchedulesData.data);
      console.log("qualitySchedulesData", qualitySchedulesData.data);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchWorkOrder = async (id) => {
    try {
      const workorder = await axios.get(`/api/v1/work-order/site/${id}`);
      setWorkOrder(workorder?.data);
    } catch (error) {
      console.log("Error fetching payment schedule:", error);
    }
  };
  const fetchPaymentSchedules = async (id) => {
    try {
      const paymentSchedulesData = await axios.get(
        `/api/v1/payment-schedule/site/${id}`,
      );
      // console.log(paymentSchedulesData.data)
      setpaymentSchedules(paymentSchedulesData.data);
    } catch (error) {
      console.log("Error fetching payment schedule:", error);
    }
  };
  // console.log(paymentSchedules);
  const fetchBill = async (id) => {
    try {
      const billData = await axios.get(`/api/v1/bill/site/${id}`);
      // console.log(billData.data)
      const contractorBill =
        billData.data?.filter((bill) => bill.billFor === "Contractor") || [];
      const supplierBill =
        billData.data?.filter((bill) => bill.billFor === "Supplier") || [];
      setContractorBill([...contractorBill]);
      setSupplierBill([...supplierBill]);
    } catch (error) {
      console.log("Error fetching bill", error);
    }
  };

  const fetchPurchaseRequest = async (id) => {
    try {
      const response = await axios.get(`/api/v1/purchase-request/site/${id}`);
      console.log("purchaseRequest", response.data);
      setPurchaseRequest(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchExtraWork = async (id) => {
    try {
      const extraWork = await axios.get(`/api/v1/extra-work/site/${id}`);
      setContractorExtra(
        extraWork.data?.filter(
          (extrawork) => extrawork.extraFor === "Contractor",
        ),
      );
      setClientExtra(
        extraWork?.data.filter(
          (extrawork) => extrawork.extraFor === "Client",
        )[0],
      );
      // console.log(extraWork.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // console.log(clientExtra);
  // console.log(contractorExtra);
  const handleEdit = (id) => {
    setEditModal(true);
    setEditId(id);
  };

  const deletePaymentDetail = async (id, index) => {
    try {
      const response = await axios.delete(
        `/api/v1/payment-schedule/${id}/paymentDetails/${index}`,
      );
      if (paymentSchedules?._id === id) {
        console.log(response.data?.existingPaymentSchedule);
        setpaymentSchedules(response.data?.existingPaymentSchedule);
      }
      console.log(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteProjectDetail = async (id, index) => {
    try {
      const response = await axios.delete(
        `/api/v1/project-schedule/${id}/projectDetails/${index}`,
      );
      setProjectDetail(response.data);
      console.table(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deletePurchaseOrder = async (id) => {
    try {
      const response = await axios.delete(`/api/v1/purchase-order/${id}`);
      setPurchaseOrder(
        purchaseOrders.filter((purchaseOrder) => purchaseOrder._id !== id),
      );
      toast.success(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteWorkOrder = async (id) => {
    try {
      await axios.delete(`/api/v1/work-order/${id}`);
      setWorkOrder(workOrders.filter((workOrder) => workOrder._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteExtraWork = async (id) => {
    try {
      await axios.delete(`/api/v1/extra-work/${id}`);
      setContractorExtra(
        contractorExtra.filter((contractorExtra) => contractorExtra._id !== id),
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteExtraWorkDetail = async (id, index) => {
    try {
      const deletedWork = await axios.delete(
        `/api/v1/extra-work/${id}/work/${index}`,
      );
      setClientExtra(deletedWork.data?.extraWork);
      toast.success(deletedWork.data?.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const SiteDetailCard = ({ handleEdit, site }) => (
    <div className="px-3 py-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{site?.name}</h2>
      <div className="flex flex-col gap-3 text-base text-gray-700">
        {[
          ["Site ID", site.siteId],
          ["Client", site.client?.name],
          ["Address", site.address],
          ["Project Type", site.projectType],
          ["Cost Center", site?.costcenter],
          ["Incharge", site.incharge?.name],
          ["Quality Engineer", site.qualityEngineer?.name],
          ["Supervisor", site.supervisor?.name],
          ["Structure", site.structureType],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <div className="text-gray-700">{label}:</div>
            <div className="font-medium">{value || "-"}</div>
          </div>
        ))}
        <div className="text-gray-700 space-y-1">
          {Array.isArray(site.floors) && site.floors.length > 0 ? (
            site.floors.map((f, i) => (
              <div key={f._id || i} className="flex justify-between">
                <span>{f.name}</span>
                <span>
                  {f.area} {f.unit}
                </span>
              </div>
            ))
          ) : (
            <span>-</span>
          )}
        </div>

        {!(user.role === "Client" || user.department === "Site Supervisor") && (
          <div className="mt-3">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <GrEdit />
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <Header category="Page" title="Site Detail's" />
      <section className="py-6 mb-16 h-full w-full">
        <div className="w-full">
          {/* Site Info */}
          <div className="grid grid-cols-1 md:grid-cols-1 w-full lg:grid-cols-1 xl:grid-cols-2 gap-6">
            <details className=" border-l-8 border-blue-500 info bg-white shadow-lg rounded-md px-2 py-3 w-full mb-8 ">
              <summary
                className="flex text-xl font-large text-color-title cursor-pointer"
                style={{ padding: "0.5rem" }}
              >
                Site Details
              </summary>
              <SiteDetailCard
                handleEdit={() => handleEdit(site._id)}
                site={site}
              />
            </details>
          </div>

          {/* Payment Schedules */}
          <div className="card">
            <details className=" border-l-8 border-blue-500 info bg-white shadow-lg rounded-lg px-2 py-3 w-full mb-8 ">
              <summary
                className="flex justify-between flex-row text-xl font-large text-color-title cursor-pointer"
                style={{ padding: "1rem" }}
              >
                Payment Schedule
                {user.role === "Client" ||
                user.department === "Site Supervisor" ? (
                  ""
                ) : (
                  <button
                    onClick={() => setPaymentModal(true)}
                    className="bg-green-500 rounded-full text-white shadow self-end p-1"
                  >
                    <MdAdd className="text-xl text-white" />
                  </button>
                )}
              </summary>
              <div
                className="overflow-x-auto"
                style={{
                  scrollbarWidth: "none",
                  "-ms-overflow-style": "none",
                }}
              >
                <table className="w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden">
                  <thead className="bg-gray-800">
                    <tr className="text-white text-left">
                      <th className="font-semibold text-sm uppercase px-6 py-4">
                        Work
                      </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                        Amount
                      </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                        Payment Date
                      </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                        Status
                      </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {paymentSchedules.paymentDetails?.map(
                      (paymentDetail, index) => (
                        <tr
                          key={index}
                          className="border-b border-blue-gray-200"
                        >
                          <td className="px-6 py-4">
                            {paymentDetail?.workDescription}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {paymentDetail?.amount}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {paymentDetail?.paymentDate
                              ? moment(paymentDetail?.paymentDate).format(
                                  "DD-MM-YYYY",
                                )
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {paymentDetail?.status}
                          </td>
                          {user.role === "Client" ||
                          user.department === "Site Supervisor" ? (
                            ""
                          ) : (
                            <td className="px-6 py-4 text-center">
                              {/* <button onClick={() => {
                              navigate(`/edit-paymentSchedule/${paymentSchedules._id}/${index}`)
                            }}
                              className="mr-2">
                              <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                            </button> */}
                              <button
                                onClick={() =>
                                  deletePaymentDetail(
                                    paymentSchedules._id,
                                    index,
                                  )
                                }
                              >
                                <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </details>
          </div>

          {/* Project Schedules */}
          <div className="card ">
            <details className=" border-l-8 border-blue-500 info bg-white shadow-lg rounded-lg px-2 py-3 w-full mb-8 ">
              <summary
                className="flex justify-between flex-row text-xl font-large text-color-title cursor-pointer"
                style={{ padding: "1rem" }}
              >
                Project Schedule
                {user.role === "Client" ||
                user.department === "Site Supervisor" ? (
                  ""
                ) : (
                  <button
                    onClick={() => setProjectModal(true)}
                    className="bg-green-500 rounded-full text-white shadow self-end p-1"
                  >
                    <MdAdd className="text-xl text-white" />
                  </button>
                )}
              </summary>
              <div
                className="overflow-x-auto"
                style={{
                  scrollbarWidth: "none",
                  "-ms-overflow-style": "none",
                }}
              >
                <table className="w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden">
                  <thead className="bg-gray-800">
                    <tr className="text-white text-left">
                      <th className="font-semibold text-sm uppercase px-6 py-4">
                        Work
                      </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                        Starting Date
                      </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                        Status
                      </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                        Actual Date
                      </th>
                      <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projectDetail?.map((work, index) => (
                      <tr key={index} className="border-b border-blue-gray-200">
                        <td className="px-6 py-4">{work.workDetail}</td>
                        <td className="px-6 py-4 text-center">
                          {work.startingStatus?.toStart
                            ? moment(work.startingStatus?.toStart).format(
                                "DD-MM-YYYY",
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">{work.status}</td>
                        <td className="px-6 py-4 text-center">
                          {work.startingStatus?.startedAt
                            ? moment(work.startingStatus?.startedAt).format(
                                "DD-MM-YYYY",
                              )
                            : "-"}
                        </td>
                        {user.role === "Client" ||
                        user.department === "Site Supervisor" ? (
                          ""
                        ) : (
                          <td className="px-6 py-4">
                            {/* <button
                              onClick={() => navigate(`/edit-projectSchedule/${site?.projectSchedule._id}/${index}`)}
                              className="mr-2"
                            >
                              <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                            </button> */}
                            <button
                              onClick={() =>
                                deleteProjectDetail(
                                  site?.projectSchedule._id,
                                  index,
                                )
                              }
                              className="mr-2"
                            >
                              <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>

          {/* Quality Check Schedule */}
          <div className="card ">
            <details className=" border-l-8 border-blue-500 info bg-white shadow-lg rounded-md px-2 py-3 w-full mb-8 ">
              <summary
                className="flex justify-between flex-row text-xl font-large text-color-title cursor-pointer"
                style={{ padding: "1rem" }}
              >
                Quality Check Schedule
                {user.department === "Site Supervisor" ||
                user.role === "Client" ? (
                  ""
                ) : (
                  <button
                    onClick={() => setQualityModal(true)}
                    className="bg-green-500 text-white p-1.5 rounded-2xl text-lg mr-2"
                  >
                    <MdAdd />
                  </button>
                )}
              </summary>
              <div
                className="overflow-x-auto"
                style={{
                  scrollbarWidth: "none",
                  "-ms-overflow-style": "none",
                }}
              >
                <table className="w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden">
                  <thead className="bg-gray-800">
                    <tr className="text-white text-left">
                      <th
                        scope="col"
                        className="font-semibold text-sm uppercase px-6 py-4 text-center"
                      >
                        Work
                      </th>
                      <th
                        scope="col"
                        className="font-semibold text-sm uppercase px-6 py-4 text-center"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="font-semibold text-sm uppercase px-6 py-4 text-center"
                      >
                        Approval Status
                      </th>
                      <th
                        scope="col"
                        className="font-semibold text-sm uppercase px-6 py-4"
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualitySchedules.map((qualitySchedule, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50 "
                      >
                        <td className="px-6 py-4 ">{qualitySchedule.work}</td>
                        <td className="px-6 py-4 text-center">
                          {moment(qualitySchedule.checkingDate).format(
                            "DD-MM-YYYY",
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {qualitySchedule.status}
                        </td>
                        {/* <td className="px-6 py-4 text-center">{work.startedAt ? moment(work.startedAt).format('DD-MM-YYYY') : '-'}</td> */}
                        <td className="px-6 py-4">
                          {/* <button onClick={() => handleRedirect(qualitySchedule._id)} className="mr-2">
                            <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                          </button> */}
                          {/* <button
                            onClick={() => handleEdit(qualitySchedule._id)}
                            className="mr-2">
                            <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                          </button> */}
                          <button
                            onClick={() => handleDelete(qualitySchedule._id)}
                          >
                            <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>

          {/* Work Order */}
          {user.role !== "Client" && (
            <>
              {/* Work Order */}
              <div className="card ">
                <details className=" border-l-8 border-blue-500 info bg-white shadow-lg rounded-md px-2 py-3 w-full mb-8 ">
                  <summary
                    className="flex justify-between flex-row text-xl font-large text-color-title cursor-pointer"
                    style={{ padding: "1rem" }}
                  >
                    Work Order
                    {user.department !== "Site Supervisor" && (
                      <button
                        onClick={() => setWorkModal(true)}
                        className="bg-green-500 rounded-2xl text-white shadow self-end p-1"
                      >
                        <MdAdd className="text-xl text-white" />
                      </button>
                    )}
                  </summary>

                  <div
                    className="overflow-x-auto"
                    style={{
                      scrollbarWidth: "none",
                      "-ms-overflow-style": "none",
                    }}
                  >
                    <table className="w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden">
                      <thead className="bg-gray-800">
                        <tr className="text-white text-left">
                          <th className="font-semibold text-sm uppercase px-6 py-4">
                            Name
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Contractor
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Duration
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Total Value
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Total Paid
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Total Due
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {workOrders?.map((workorder) => (
                          <tr
                            key={workorder._id}
                            className="border-b border-blue-gray-200"
                          >
                            <td className="px-6 py-4">
                              {workorder.workOrderName}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {workorder.contractor?.name}
                            </td>
                            <td className="px-6 py-4 text-center ">
                              {workorder.duration
                                ? moment(workorder.duration).format(
                                    "DD-MM-YYYY",
                                  )
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {workorder.workOrderValue}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {workorder.totalPaid}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {workorder.totalDue}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() =>
                                  navigate(`/work-order/${workorder._id}`)
                                }
                                className="mr-2"
                              >
                                <FaExternalLinkAlt className="text-green-500 hover:text-green-600 text-lg" />
                              </button>
                              {user.department !== "Site Supervisor" && (
                                <>
                                  {/* <button
                                onClick={() => navigate(`/edit-workOrder/${workorder._id}`)}
                                className="mr-2">
                                <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                              </button> */}
                                  <button
                                    onClick={() =>
                                      deleteWorkOrder(workorder._id)
                                    }
                                  >
                                    <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>

              {/* Bills */}
              <div className="card ">
                <details className=" border-l-8 border-blue-500 info bg-white shadow-lg rounded-md px-2 py-3 w-full mb-8 ">
                  <summary
                    className="flex justify-between flex-row text-xl font-large text-color-title cursor-pointer"
                    style={{ padding: "1rem" }}
                  >
                    Bills
                    {user.department !== "Site Supervisor" && (
                      <button
                        onClick={() => setBillModal(true)}
                        className="bg-green-500 rounded-2xl text-white shadow self-end p-1"
                      >
                        <MdAdd className="text-xl text-white" />
                      </button>
                    )}
                  </summary>
                  <div
                    className="overflow-x-auto"
                    style={{
                      scrollbarWidth: "none",
                      "-ms-overflow-style": "none",
                    }}
                  >
                    <table className="w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden">
                      <thead className="bg-gray-800">
                        <tr className="text-white text-left">
                          <th className="font-semibold text-sm uppercase px-6 py-4">
                            Contractor
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Work
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Amount
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Payment Date
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Paid
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Due
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Status
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {contractorBills.map((bill) => (
                          <tr
                            key={bill._id}
                            className="border-b border-blue-gray-200"
                          >
                            <td className="px-6 py-4">
                              {bill?.contractor?.name}
                            </td>
                            <td className="px-6 py-4">
                              {bill?.billOf.workDescription}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {bill?.billOf.amount}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {bill?.dateOfPayment
                                ? moment(bill?.dateOfPayment).format(
                                    "DD-MM-YYYY",
                                  )
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {bill?.paidAmount ? bill?.paidAmount : "0"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {bill?.dueAmount ? bill?.dueAmount : "0"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {bill?.paymentStatus}
                            </td>
                            <td className="px-3 py-4 text-center">
                              <button
                                onClick={() => navigate(`/bill/${bill._id}`)}
                                className="mr-2"
                              >
                                <FaExternalLinkAlt className="text-green-500 hover:text-green-600 text-lg" />
                              </button>
                              {/* <button
                                onClick={() => { }}
                                className=" mr-2">
                                <GrEdit className='bg-blue-500 hover:text-blue-600 text-xl' />
                              </button>
                              <button
                              onClick={() => {}}>
                                <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                              </button> */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>

              {/* Purchase Order */}
              <div className="card ">
                <details className=" border-l-8 border-blue-500 info bg-white shadow-lg rounded-md px-2 py-3 w-full mb-8 ">
                  <summary
                    className="flex justify-between flex-row text-xl font-large text-color-title cursor-pointer"
                    style={{ padding: "1rem" }}
                  >
                    Purchase Request
                    {user.department !== "Site Supervisor" && (
                      <button
                        onClick={() => setPurchaseModal(true)}
                        className="bg-green-500 rounded-2xl text-white shadow self-end p-1"
                      >
                        <MdAdd className="text-xl text-white" />
                      </button>
                    )}
                  </summary>
                  <div
                    className="overflow-x-auto"
                    style={{
                      scrollbarWidth: "none",
                      "-ms-overflow-style": "none",
                    }}
                  >
                    <table className="w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden">
                      <thead className="bg-gray-800">
                        <tr className="text-white text-left">
                          <th className="font-semibold text-sm uppercase px-6 py-4">
                            Requirement For
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Category
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Request Date
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Status
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Approval
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {purchaseRequests?.map((purchaseRequest, index) => (
                          <tr
                            key={index}
                            className="border-b border-blue-gray-200"
                          >
                            <td className="px-6 py-4">
                              {purchaseRequest.requirementFor}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {purchaseRequest.category}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {moment(purchaseRequest.reqDate).format(
                                "DD MMMM YYYY",
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {purchaseRequest.status}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {purchaseRequest.approvalStatus}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/purchase-request/${purchaseRequest?._id}`,
                                  )
                                }
                                className="mr-2"
                              >
                                <FaExternalLinkAlt className="text-green-500 hover:text-green-600 text-lg" />
                              </button>
                              {user.department !== "Site Supervisor" && (
                                <>
                                  {/* <button
                                onClick={() => navigate(`/edit-purchaseOrder/${purchaseRequest?._id}`)}
                                className="mr-2">
                                <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                              </button> */}
                                  <button
                                    onClick={() =>
                                      deletePurchaseOrder(purchaseRequest?._id)
                                    }
                                  >
                                    <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            </>
          )}

          {/* Extra Work */}
          <div className="card ">
            <details className=" border-l-8 border-blue-500 info bg-white shadow-lg rounded-md px-2 py-3 w-full mb-8 ">
              <summary
                className="flex justify-between flex-row text-xl font-large text-color-title cursor-pointer"
                style={{ padding: "1rem" }}
              >
                Extra Work
                {user.department === "Site Supervisor" ||
                user.role === "Client" ? (
                  ""
                ) : (
                  <button
                    onClick={() => setExtraModal(true)}
                    className="bg-green-500 rounded-2xl text-white shadow self-end p-1"
                  >
                    <MdAdd className="text-xl text-white" />
                  </button>
                )}
              </summary>
              <Tabs defaultActiveKey="client">
                <Tabs.TabPane tab="Client" key={"client"}>
                  <div
                    className="overflow-x-auto"
                    style={{
                      scrollbarWidth: "none",
                      "-ms-overflow-style": "none",
                    }}
                  >
                    <table className="w-full whitespace-nowrap bg-white overflow-x-auto">
                      <thead className="bg-gray-800">
                        <tr className="text-white text-left">
                          <th className="font-semibold text-sm uppercase px-6 py-4">
                            Work
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Rate
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Area
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Amount
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                            Status
                          </th>
                          <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {clientExtra?.WorkDetail?.map((workDetail, index) => (
                          <tr
                            key={index}
                            className="border-b border-blue-gray-200"
                          >
                            <td className="px-6 py-4">{workDetail?.work}</td>
                            <td className="px-6 py-4 text-center">
                              {workDetail?.rate}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {workDetail?.area}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {workDetail?.amount}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {workDetail?.paymentStatus}
                            </td>
                            {user.department === "Site Supervisor" ||
                            user.role === "Client" ? (
                              ""
                            ) : (
                              <td className="px-3 py-4 text-center">
                                {/* <button
                                  onClick={() => navigate(`/extra-work/${clientExtra._id}/work/${index}`)}
                                  className=" mr-2">
                                  <GrEdit className='text-blue-500 hover:text-blue-600 text-xl' />
                                </button> */}
                                <button
                                  onClick={() =>
                                    deleteExtraWorkDetail(
                                      clientExtra._id,
                                      index,
                                    )
                                  }
                                >
                                  <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="text-right mt-8 ml-2 flex gap-2">
                      {user.department === "Site Supervisor" ||
                      user.role === "Client" ? (
                        ""
                      ) : (
                        <button
                          onClick={() =>
                            navigate(`/edit-extra-work/${clientExtra._id}`)
                          }
                          className="text-green-500 hover:text-green-600 text-lg flex items-center gap-1 mr-2"
                        >
                          <MdAdd className="text-2xl" /> More
                        </button>
                      )}
                      <button
                        onClick={() =>
                          navigate(`/extra-work/${clientExtra._id}`)
                        }
                        className="ml-2"
                      >
                        <FaExternalLinkAlt className="text-lg text-blue-500 hover:text-blue-600" />
                      </button>
                    </div>
                  </div>
                </Tabs.TabPane>

                {user.role === "Client" ? (
                  ""
                ) : (
                  <Tabs.TabPane tab="Contractor" key={"contractor"}>
                    <div
                      className="overflow-x-auto"
                      style={{
                        scrollbarWidth: "none",
                        "-ms-overflow-style": "none",
                      }}
                    >
                      <table className="w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden">
                        <thead className="bg-gray-800">
                          <tr className="text-white text-left">
                            <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                              Contractor
                            </th>
                            <th className="font-semibold text-sm uppercase px-6 py-4">
                              Work
                            </th>
                            <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                              Amount
                            </th>
                            <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                              Paid
                            </th>
                            <th className="font-semibold text-sm uppercase px-6 py-4 text-center">
                              Due
                            </th>
                            <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                          {contractorExtra.map((extraWork) => (
                            <tr
                              key={extraWork._id}
                              className="border-b border-blue-gray-200"
                            >
                              <td className="px-6 py-4">
                                {extraWork?.contractor?.name}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {extraWork?.WorkDetail.length}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {extraWork?.totalAmount}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {extraWork?.paid}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {extraWork?.due}
                              </td>
                              <td className="px-3 py-4">
                                <button
                                  onClick={() =>
                                    navigate(`/extra-work/${extraWork._id}`)
                                  }
                                  className="mr-2"
                                >
                                  <FaExternalLinkAlt className="text-green-500 hover:text-green-600 text-xl" />
                                </button>
                                {user.department !== "Site Supervisor" && (
                                  <>
                                    {/* <button
                                    onClick={() => navigate(`/edit-extra-work/${extraWork._id}`)}
                                    className="mr-2">
                                    <GrEdit className='text-blue-500 hover:text-blue-600 text-xl' />
                                  </button> */}
                                    <button
                                      onClick={() =>
                                        deleteExtraWork(extraWork._id)
                                      }
                                    >
                                      <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Tabs.TabPane>
                )}
              </Tabs>
            </details>
          </div>
        </div>
        <Toaster position="top-right" reverseOrder={false} />
        <Modal
          isOpen={paymentModal}
          onClose={() => setPaymentModal(false)}
          head="Create Payment Schedule"
        >
          <CreatePaymentSchedule onClose={() => setPaymentModal(false)} />
        </Modal>
        <Modal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          head="Edit Site"
        >
          <CreateSite onClose={() => setEditModal(false)} isEdit={editId} />
        </Modal>
      </section>
    </div>
  );
};

export default SiteScreen;
