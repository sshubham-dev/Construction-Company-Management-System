import { useState, useRef, useEffect } from "react";
import { Tabs } from "antd";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import moment from "moment";
import { FcApproval } from "react-icons/fc";
import { BiLinkExternal } from "react-icons/bi";
import { LuShieldX } from "react-icons/lu";
import Header from "../../components/Header";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import { X } from "lucide-react";
import Reject from "../../components/UI/Reject";

axios.defaults.withCredentials = true;

const LeaveView = ({ isOpen, data, onClose }) => {
  if (!isOpen) return null;

  const leave = data?.data || {};
  const sender = leave?.user?.name || "—";
  const approver = data?.by?.name || "—";
  const purpose = data?.approvalOf || "Leave";

  return (
    <div className="fixed inset-0 z-[80] flex justify-center items-center p-8 bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-3">
          <h2 className="text-lg font-semibold">Leave Request</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-gray-700">
          {/* Approval Info */}
          <div className="border-b pb-4">
            <p className="text-sm text-gray-500 mb-1">Approval Details</p>
            <div className="text-sm">
              <p>
                <span className="font-semibold">Purpose:</span> {purpose}
              </p>
              <p>
                <span className="font-semibold">Requested By:</span> {approver}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(data?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Leave Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="text-base font-medium">{leave.from || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reporting Date</p>
              <p className="text-base font-medium">
                {leave.reportingDate || "—"}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-sm text-gray-500">Reason</p>
            <p className="text-base font-medium">{leave.reason || "—"}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end bg-gray-50 border-t px-4 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Approval = () => {
  const [allApprovals, setAllApprovals] = useState([]);
  const [pendingApprovals, setPendingApproval] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejectedApproval] = useState([]);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [openLeaveModal, setOpenLeaveModal] = useState(false);
  const [leaveData, setLeaveData] = useState(null);
  const { user } = useSelector((state) => {
    return state.auth;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      fetchApproval(user._id);
      fetchApproved(user._id);
      fetchRejected(user._id);
    }
  }, []);

  const fetchApproval = async (id) => {
    try {
      console.log(id);
      const response = await axios.get(`/api/v1/approval/pending/user/${id}`);
      console.log(response.data);
      const approvalData = response.data;
      // const sites = async (id)=>{
      //     return await axios.get(`/api/v1/site/${id}`);
      // };
      // let siteData = [];
      // //  await axios.get(`/api/v1/site/${siteId}`);
      // const siteId = approvalData.map(approval => {
      //      return approval.data.site
      // });
      // siteId.forEach( site =>  {
      //     siteData = sites(site)
      // });
      // console.log("siteData.data:", siteData)
      // approvalData.data.site = siteData.data;
      // if(approvalData?.data.supplier){
      //   const supplierData = await axios.get(`/api/v1/supplier/${approvalData?.data.supplier}`);
      //   approvalData?.data.supplier = supplierData.data;
      // }else if(approvalData?.data.contractor){
      //   const contractorData = await axios.get(`/api/v1/contractor/${approvalData?.data.contractor}`);
      //   approvalData?.data.contractor = contractorData.data;
      // }
      setAllApprovals(approvalData);
      setPendingApproval(approvalData);
      console.log(approvalData);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRejected = async (id) => {
    try {
      console.log(id);
      const response = await axios.get(`/api/v1/approval/rejected/user/${id}`);
      const rejectData = response.data;
      setRejectedApproval(rejectData);
      console.log("rejectData", rejectData);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchApproved = async (id) => {
    try {
      // console.log(id)
      const response = await axios.get(`/api/v1/approval/approved/user/${id}`);
      const approvedData = response.data;
      setApproved(approvedData);
      // console.log(approvedData)
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (id) => {
    try {
      // console.log(id)
      const response = await axios.put(`/api/v1/approval/${id}`);
      // console.log(response.data)
      setPendingApproval(
        pendingApprovals.filter((pendingApproval) => pendingApproval._id !== id)
      );
      toast.success(response.data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    try {
      setRejectId(id);
      setRejectModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log(id);
      const response = await axios.delete(`/api/v1/approval/${id}`);
      setApproved(approved.filter((approved) => approved._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveView = (data) => {
    try {
      setOpenLeaveModal(true);
      setLeaveData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const navigateTo = (approvalOf, id, data, approvalId) => {
    switch (approvalOf) {
      case "Bill":
        navigate(`/bill/${id}/approval/${approvalId}`);
        break;
      case "Purchase Order":
        navigate(`/purchase-order/${id}/approval/${approvalId}`);
        break;
      case "Project Schedule":
        navigate(`/project-schedule/${id}/approval/${approvalId}`);
        break;
      case "Payment Schedule":
        navigate(`/payment-schedule/${id}/approval/${approvalId}`);
        break;
      case "Quality Schedule":
        navigate(`/quality-schedule/${id}/approval/${approvalId}`);
        break;
      case "Purchase Request":
        navigate(`/purchase-request/${id}/approval/${approvalId}`);
        break;
      case "Extra Work":
        navigate(`/extra-work/${id}/approval/${approvalId}`);
        break;
      case "Work Order":
        navigate(`/work-order/${id}/approval/${approvalId}`);
        break;
      case "Leave":
        handleLeaveView(data);
        break;

      default:
        break;
    }
  };

  const ApprovalCard = ({
    workDescription,
    site,
    by,
    date,
    view,
    approve,
    reject,
  }) => {
    return (
      <div className=" px-4 py-6 ">
        <h2 className="text-xl font-semibold mb-4 uppercase">
          {workDescription} {site}
        </h2>
        <div className="flex flex-col gap-2 text-md">
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Date:</div>
            <div className="text-gray-800">
              {date ? moment(date).format("DD-MM-YYYY") : "-"}
            </div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Created By:</div>
            <div className="text-gray-600">{by}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight text-lg mt-2">
            <button
              onClick={view}
              className="text-blue-500 mr-2 hover:text-blue-700"
            >
              <BiLinkExternal className="inline-block mr-1" />
              View
            </button>
            <button
              onClick={approve}
              className="text-green-500 hover:text-green-700 mr-2"
            >
              <FcApproval className="inline-block mr-1" />
              Approve
            </button>
            <button
              onClick={reject}
              className="text-red-500 hover:text-red-700"
            >
              <LuShieldX className="inline-block mr-1" />
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ApprovedCard = ({ workDescription, site, by, date, view, remove }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4 uppercase">
          {workDescription} {site}
        </h2>
        <div className="flex flex-col gap-2 text-md">
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Date:</div>
            <div className="text-gray-800">
              {date ? moment(date).format("DD-MM-YYYY") : "-"}
            </div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Approved By:</div>
            <div className="text-gray-600">{by}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight text-lg mt-2">
            <button
              onClick={view}
              className="text-blue-500 mr-2 hover:text-blue-700"
            >
              <BiLinkExternal className="inline-block mr-1" />
              View
            </button>
            <button
              onClick={remove}
              className="text-red-500 hover:text-red-700"
            >
              <MdDelete className="inline-block mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RejectCard = ({
    workDescription,
    site,
    by,
    date,
    view,
    message,
    remove,
  }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4 uppercase">
          {workDescription} {site}
        </h2>
        <div className="flex flex-col gap-2 text-md">
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Date:</div>
            <div className="text-gray-800">
              {date ? moment(date).format("DD-MM-YYYY") : "-"}
            </div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Approved By:</div>
            <div className="text-gray-600">{by}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Message:</div>
            <div className="text-gray-600">{message}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight text-lg mt-2">
            <button
              onClick={view}
              className="text-blue-500 mr-2 hover:text-blue-700"
            >
              <BiLinkExternal className="inline-block mr-1" />
              View
            </button>
            {/* <button onClick={remove} className="text-red-500 hover:text-red-700">
                            <MdDelete className="inline-block mr-1" />
                            Delete
                        </button> */}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header category="Page" title="Approval" />
      <section className="h-full w-full overflow-x-auto">
        <div className="flex space-x-4 border-b-2 mb-4 w-full md:w-auto">
          <button
            className={`px-4 py-2 ${
              activeTab === "pending"
                ? "border-b-4 border-blue-500 font-bold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "approved"
                ? "border-b-4 border-blue-500 font-bold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("approved")}
          >
            Approved
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "rejected"
                ? "border-b-4 border-blue-500 font-bold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected
          </button>
        </div>

        {activeTab === "pending" && (
          <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1 h-full">
            {pendingApprovals.map((approval) => (
              <div
                key={approval._id}
                className="bg-white shadow-md rounded-2xl"
              >
                <ApprovalCard
                  workDescription={approval.approvalOf}
                  date={approval.date}
                  by={approval.by?.name}
                  view={() =>
                    navigateTo(
                      approval.approvalOf,
                      approval?.data?._id,
                      approval,
                      approval?._id
                    )
                  }
                  approve={() => handleApprove(approval?._id)}
                  reject={() => handleReject(approval?._id)}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "approved" && (
          <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1 h-full">
            {approved.map((approved) => (
              <div
                key={approved._id}
                className="bg-white shadow-md rounded-2xl"
              >
                <ApprovedCard
                  workDescription={approved.approvalOf}
                  date={approved.date}
                  by={approved.by?.name}
                  view={() =>
                    navigateTo(
                      approved.approvalOf,
                      approved?.data?._id,
                      approved?.data
                    )
                  }
                  remove={() => handleDelete(approved?._id)}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "rejected" && (
          <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1 h-full">
            {rejected.map((reject) => (
              <div key={reject._id} className="bg-white shadow-md rounded-2xl">
                <RejectCard
                  workDescription={reject.approvalOf}
                  date={reject.date}
                  by={reject.by?.name}
                  message={reject.message}
                  view={() =>
                    navigateTo(
                      reject.approvalOf,
                      reject?.data?._id,
                      reject?.data
                    )
                  }
                  // remove={() => handleDelete(approved?._id)}
                />
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={rejectModal}
          onClose={() => setRejectModal(false)}
          head="Reject Reason"
        >
          <Reject onClose={() => setRejectModal(false)} Id={rejectId} />
        </Modal>
        {/* <Modal
          isOpen={openLeaveModal}
          onClose={() => setOpenLeaveModal(false)}
        //   head="Leave Details"
        > */}
        <LeaveView
          isOpen={openLeaveModal}
          onClose={() => setOpenLeaveModal(false)}
          data={leaveData}
        />
        {/* </Modal> */}

        <Toaster position="top-right" reverseOrder={false} />
      </section>
    </div>
  );
};

export default Approval;
