// Quotations.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiTrash2, FiDownload, FiEye, FiX } from "react-icons/fi";
import CreateQuotation from "../../components/CreateQuotation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QuotationPDF from "../../pdf/QuotationPdf";

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingQuote, setEditingQuote] = useState(null);
  const [viewingQuote, setViewingQuote] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadQuotations = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/v1/calculator/quote");
        if (res?.data && Array.isArray(res.data)) {
          console.log(res.data);
          setQuotations(res.data);
        }
      } catch (err) {
        console.error("Failed to load quotations", err);
      } finally {
        setLoading(false);
      }
    };
    loadQuotations();
  }, []);

  const openEdit = (q) => {
    setEditingQuote(q);
    setShowModal(true);
  };

  const openView = (q) => setViewingQuote(q);

  const handleDelete = async (q) => {
    if (!window.confirm(`Delete quotation "${q.name}"?`)) return;
    try {
      await axios.delete(`/api/v1/calculator/quote/${q._id}`);
      setQuotations((prev) => prev.filter((x) => x._id !== q._id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const upsertQuotation = (saved) => {
    setQuotations((prev) => {
      const exists = prev.find((p) => p._id === saved._id);
      if (exists) return prev.map((p) => (p._id === saved._id ? saved : p));
      return [saved, ...prev];
    });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>

          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow w-full sm:w-auto"
            onClick={() => {
              setEditingQuote(null);
              setShowModal(true);
            }}
          >
            + New Quotation
          </button>
        </div>

        {/* Loading / Empty */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : quotations.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No quotations found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotations.map((q) => (
              <div
                key={q._id}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-lg transition flex flex-col"
              >
                {/* Card Top */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Client</div>
                    <div className="font-semibold text-gray-900">
                      {q.lead?.name}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm font-bold text-green-700">
                      ₹{Number(q.totals?.total || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Package:</strong> {q.package?.name || "-"}
                  </p>
                  <p>
                    <strong>Structure:</strong> {q.structure?.raw || "-"}
                  </p>
                  {q.durationInMonths && (
                    <p>
                      <strong>Duration:</strong> {q.durationInMonths} months
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-row justify-between gap-3">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 border rounded-md py-2 text-sm hover:bg-gray-100"
                    onClick={() => openView(q)}
                  >
                    <FiEye /> View
                  </button>

                  <PDFDownloadLink
                    document={<QuotationPDF quote={q} />}
                    fileName={`${q?.name || "quotation"}.pdf`}
                    className="flex-1"
                  >
                    {({ loading }) => (
                      <button className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md w-full py-2 text-sm hover:bg-blue-700 transition">
                        <FiDownload /> {loading ? "..." : "PDF"}
                      </button>
                    )}
                  </PDFDownloadLink>

                  <button
                    className="flex-1 flex items-center justify-center gap-2 border rounded-md py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(q)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ----------------------------- */}
        {/* VIEW MODAL */}
        {/* ----------------------------- */}
        {viewingQuote && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="p-4 border-b flex justify-between items-start bg-[#F6FFF9]">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {viewingQuote.lead?.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Quote: {viewingQuote._id}
                  </p>
                </div>

                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setViewingQuote(null)}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg bg-[#F6FFF9]">
                    <h4 className="font-bold text-green-800 mb-1 text-sm">
                      Package
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Name: {viewingQuote.package?.name}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Total: ₹
                      {Number(viewingQuote.totals?.total).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg bg-[#F6FFF9]">
                    <h4 className="font-bold text-green-800 mb-1 text-sm">
                      Structure
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Type: {viewingQuote.structure?.raw}
                    </p>
                    <p className="text-gray-700 text-sm">
                      Duration: {viewingQuote.durationInMonths} months
                    </p>
                  </div>
                </div>

                {/* Levels */}
                {viewingQuote.structure?.levels?.length > 0 && (
                  <Section title="Levels">
                    <ResponsiveTable
                      headers={["Floor", "Area", "Scope", "Usage"]}
                      rows={viewingQuote.structure.levels.map((lvl) => [
                        lvl.label,
                        `${lvl.area} sqft`,
                        lvl.scope,
                        lvl.usage,
                      ])}
                    />
                  </Section>
                )}

                {/* Work Breakdown */}
                {viewingQuote.workLines?.length > 0 && (
                  <Section title="Work Breakdown">
                    <ResponsiveTable
                      headers={[
                        "Description",
                        "Unit",
                        "Qty",
                        "Rate",
                        "Amount",
                      ]}
                      rows={viewingQuote.workLines.map((w) => [
                        w.description,
                        w.unit,
                        w.quantity,
                        `₹${w.rate}`,
                        `₹${w.amount}`,
                      ])}
                    />
                  </Section>
                )}

                {/* Optional Works */}
                {viewingQuote.optionalWorks?.length > 0 && (
                  <Section title="Optional Works">
                    <ResponsiveTable
                      headers={["Item", "Unit", "Qty", "Rate", "Amount"]}
                      rows={viewingQuote.optionalWorks.map((w) => [
                        `${w.title} of Size - ${w?.length}' X ${w?.height}' ${w?.width ? `X ${w?.width}'` : ""}`,
                        w.unit,
                        w.quantity,
                        `₹${w.rate}`,
                        `₹${w.amount}`,
                      ])}
                    />
                  </Section>
                )}
              </div>

              <div className="p-4 border-t flex justify-end bg-gray-50">
                <button
                  className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  onClick={() => setViewingQuote(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------- */}
        {/* CREATE / EDIT MODAL */}
        {/* ----------------------------- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 p-3 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-semibold text-lg">
                  {editingQuote ? "Edit Quotation" : "New Quotation"}
                </h3>

                <button
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>

              <div className="min-h-[480px]">
                <CreateQuotation
                  initialData={editingQuote || null}
                  initialStep={editingQuote ? "quote" : "start"}
                  onSave={upsertQuotation}
                  onClose={() => setShowModal(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ----------------------------- */
/* Reusable Components */
/* ----------------------------- */

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-lg font-semibold text-green-800 mb-2">{title}</h2>
    {children}
  </div>
);

const ResponsiveTable = ({ headers, rows }) => (
  <div>
    {/* Desktop table */}
    <div className="hidden md:block overflow-x-auto border rounded-lg">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className={`p-2 border text-left font-semibold text-gray-700 ${i === 0 ? "w-[45%]" : i === -1 ? "w-[13%]": "w-[cal(45-13)%]"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((cell, idx) => (
                <td key={idx} className={`p-2 border ${idx === 0 ? "w-[45%]" : idx === -1 ? "w-[13%]": "w-[cal(45-13)%]"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile cards */}
    <div className="md:hidden space-y-3 mt-3">
      {rows.map((r, i) => (
        <div key={i} className="border rounded-lg p-3 bg-white shadow-sm">
          {headers.map((h, idx) => (
            <div
              key={idx}
              className="flex justify-between py-1 text-xs text-gray-700"
            >
              <span className="font-semibold">{h}</span>
              <span>{r[idx]}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Quotations;
