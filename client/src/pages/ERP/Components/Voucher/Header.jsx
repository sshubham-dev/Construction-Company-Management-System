import {
  FiArrowLeft,
  FiEdit2,
  FiPrinter,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const statusColor = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  POSTED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function Header({
  voucher,
  onEdit,
  onPrint,
  onDownload,
  onPost,
  onCancel,
}) {
  console.log(voucher);
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}

        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border p-2 hover:bg-gray-100"
          >
            <FiArrowLeft size={18} />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {voucher?.type} Voucher
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[voucher?.status]}`}
              >
                {voucher?.status}
              </span>
            </div>

            <p className="mt-2 text-lg font-semibold text-blue-700">
              {voucher?.voucherNo}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {new Date(voucher?.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Right */}

        {/* <div className="flex flex-wrap gap-2">
          {voucher?.status === "DRAFT" && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
              >
                <FiEdit2 />
                Edit
              </button>

              <button
                onClick={onPost}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <FiCheckCircle />
                Post
              </button>
            </>
          )}

          {voucher?.status === "POSTED" && (
            <>
              <button
                onClick={onPrint}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
              >
                <FiPrinter />
                Print
              </button>

              <button
                onClick={onDownload}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
              >
                <FiDownload />
                PDF
              </button>

              <button
                onClick={onCancel}
                className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <FiXCircle />
                Cancel
              </button>
            </>
          )}
        </div> */}
      </div>

      {/* Footer Information */}

      <div className="grid gap-4 border-t bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Info title="Reference" value={voucher?.reference || "-"} />

        <Info title="Created By" value={voucher?.createdBy?.userName} />

        <Info title="Posted By" value={voucher?.postedBy?.userName || "-"} />

        <Info title="Narration" value={voucher?.narration || "-"} />
      </div>
    </div>
  );
}

function Info({ title, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>

      <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
