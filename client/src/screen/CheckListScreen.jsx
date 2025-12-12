import React, { useEffect, useState } from "react";
import {  useParams } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ChecklistPdf from "../pdf/CheckListPdf";

const CheckListScreen = () => {
  const { id, approvalId } = useParams();
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const res = await axios.get(`/api/v1/checklist/${id}`);
        setChecklist(res.data);
      } catch (err) {
        toast.error("Failed to load checklist");
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Loading checklist...</p>;
  }

  if (!checklist) {
    return (
      <p className="text-center mt-10 text-red-500">Checklist not found</p>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <Header category="Page" title="Checklist Details" />

      {/* ✅ BASIC INFO */}
      <div className="bg-white rounded-lg shadow p-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Checklist Name</p>
          <p className="font-semibold">{checklist.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Check For</p>
          <p className="font-semibold">{checklist.checkFor}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Site</p>
          <p className="font-semibold">{checklist?.site?.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Supervisor</p>
          <p className="font-semibold">{checklist?.supervisor?.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold">
            {new Date(checklist.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Approval Status</p>
          <span
            className={`inline-block mt-1 px-3 py-1 rounded text-white text-sm ${
              checklist.approvalStatus === "Approved"
                ? "bg-green-500"
                : "bg-orange-500"
            }`}
          >
            {checklist.approvalStatus}
          </span>
        </div>
      </div>

      {/* ✅ CHECK WORK LIST */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h3 className="font-semibold mb-3">Inspection Checklist</h3>

        <div className="space-y-3">
          {checklist.checkWork.map((item, index) => (
            <div
              key={item._id}
              className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <p className="text-sm font-medium">
                {index + 1}. {item.work}
              </p>

              <div className="flex items-center gap-4">
                <span
                  className={`px-2 py-1 rounded text-xs text-white ${
                    item.status === "Yes"
                      ? "bg-green-500"
                      : item.status === "No"
                      ? "bg-red-500"
                      : "bg-gray-400"
                  }`}
                >
                  {item.status}
                </span>

                {item.remarks && (
                  <span className="text-xs text-gray-600">
                    Remarks: {item.remarks}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ OBSERVATION */}
      {checklist.observation && (
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h3 className="font-semibold mb-2">Observation</h3>
          <p className="text-sm text-gray-700">{checklist.observation}</p>
        </div>
      )}

      {/* ✅ RATINGS */}
      {checklist.rating?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h3 className="font-semibold mb-3">Ratings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklist.rating.map((rate) => (
              <div
                key={rate._id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{rate.category}</p>
                  <p className="text-xs text-gray-600">{rate.remarks}</p>
                </div>

                <div className="text-yellow-500 font-bold">{rate.stars} ★</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ APPROVALS */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <h3 className="font-semibold mb-3">Approval Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-3 rounded text-center">
            <p className="text-sm font-medium">Authority</p>
            <p
              className={`mt-1 font-semibold ${
                checklist?.authoritySign?.approved
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {checklist?.authoritySign?.approved ? "Approved" : "Pending"}
            </p>
          </div>

          <div className="border p-3 rounded text-center">
            <p className="text-sm font-medium">Contractor</p>
            <p
              className={`mt-1 font-semibold ${
                checklist?.contractorSign?.approved
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {checklist?.contractorSign?.approved ? "Approved" : "Pending"}
            </p>
          </div>

          <div className="border p-3 rounded text-center">
            <p className="text-sm font-medium">Client</p>
            <p
              className={`mt-1 font-semibold ${
                checklist?.clientSign?.approved
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {checklist?.clientSign?.approved ? "Approved" : "Pending"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end mt-6 gap-3">
        <PDFDownloadLink
          document={<ChecklistPdf checklist={checklist} />}
          fileName={`${
            checklist.site?.name + "-" + checklist.name || "Checklist"
          }.pdf`}
        >
          {({ loading }) => (
            <button
              type="button"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              {loading ? "Preparing..." : "Download PDF"}
            </button>
          )}
        </PDFDownloadLink>
        {/* <button
                  type="button"
                  className="bg-green-600 flex justify-center items-center gap-3 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
                  onClick={() => handleEdit(bill._id)}
                >
                  <GrEdit /> Edit
                </button> */}
        {approvalId !== undefined && (
          <>
            <button
              type="button"
              className="bg-emerald-600 text-white px-5 py-2 rounded-lg shadow hover:bg-emerald-700 transition"
              onClick={handleApprove}
            >
              Approve
            </button>
            <button
              type="button"
              className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700 transition"
              onClick={handleReject}
            >
              Reject
            </button>
          </>
        )}
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CheckListScreen;
