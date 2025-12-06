import { CheckCircle, Clock, AlertCircle, ListChecks } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
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

export default function Approvals({ showApprovals, setShowApprovals }) {
  const [approvals, setApprovals] = useState([]);
  const { user } = useSelector((state) => {
    return state.auth;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      fetchApproval(user._id);
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
      setApprovals(approvalData);
      console.log(approvalData);
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
    console.log(approvalOf, approvalId, id)
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

  return (
    <div className="z-0">
      <div
        className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg cursor-pointer hover:bg-white/80 transition"
        onClick={() => setShowApprovals(true)}
      >
        <div className="flex justify-between items-center">
          <p className="text-gray-500 text-sm">Approvals</p>
          <ListChecks size={20} className="text-purple-500" />
        </div>
        <p className="text-lg font-bold mt-1">{approvals.length} Pending</p>
      </div>
      {showApprovals && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="bg-white w-80 h-full p-4 overflow-y-auto shadow-lg">
            <h2 className="font-semibold text-lg mb-4">Approvals</h2>
            <div
              className=" overflow-y-auto py-1 "
              style={{ maxHeight: "83vh" }}
            >
              {approvals.map((approval, index) => (
                <div
                  key={index}
                  onClick={() =>
                    navigateTo(
                      approval.approvalOf,
                      approval?.data?._id,
                      approval,
                      approval?._id
                    )
                  }
                  className="p-3 rounded-lg bg-gray-50 mb-2 flex justify-between items-center cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900">
                      {approval.approvalOf}
                    </span>
                    <span className="text-xs font-medium text-gray-600">
                      {approval.by?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-800">
                      {approval.date
                        ? moment(approval.date).format("DD-MM-YYYY")
                        : "-"}
                    </span>
                    <Clock size={18} className="text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowApprovals(false)}
              className="mt-4 w-full bg-purple-500 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
