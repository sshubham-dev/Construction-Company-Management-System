import {
  FiEye,
  FiEdit2,
  FiCheck,
  FiTrash2,
  FiPrinter,
  FiXCircle,
  FiArrowRight,
} from "react-icons/fi";

const statusColor = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  POSTED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const typeColor = {
  PURCHASE: "bg-blue-100 text-blue-700",
  SALES: "bg-purple-100 text-purple-700",
  PAYMENT: "bg-orange-100 text-orange-700",
  RECEIPT: "bg-green-100 text-green-700",
  CONTRA: "bg-indigo-100 text-indigo-700",
  JOURNAL: "bg-gray-100 text-gray-700",
};

const FIELD_MAP = {
  purchase: [
    {
      label: "Supplier",
      key: "supplierName",
    },
    {
      label: "Invoice",
      key: "supplierInvoiceNo",
    },
    {
      label: "Project",
      key: "siteName",
    },
    {
      label: "Amount",
      key: "totalDebit",
      type: "currency",
    },
    {
      label: "Outstanding",
      key: "outstanding",
      type: "currency",
    },
  ],

  sales: [
    {
      label: "Client",
      key: "clientName",
    },
    {
      label: "Invoice",
      key: "invoiceNo",
    },
    {
      label: "Project",
      key: "siteName",
    },
    {
      label: "Amount",
      key: "totalDebit",
      type: "currency",
    },
    {
      label: "Receivable",
      key: "receivable",
      type: "currency",
    },
  ],

  payment: [
    {
      label: "Paid To",
      key: "paidTo",
    },
    {
      label: "Paid From",
      key: "paidFrom",
    },
    {
      label: "Amount",
      key: "totalDebit",
      type: "currency",
    },
  ],

  receipt: [
    {
      label: "Received From",
      key: "receivedFrom",
    },
    {
      label: "Receive Into",
      key: "receivedInto",
    },
    {
      label: "Amount",
      key: "totalDebit",
      type: "currency",
    },
  ],

  contra: [
    {
      label: "From",
      key: "creditLedger",
    },
    {
      label: "To",
      key: "debitLedger",
    },
    {
      label: "Amount",
      key: "totalDebit",
      type: "currency",
    },
  ],

  journal: [
    {
      label: "Debit",
      key: "debitLedger",
    },
    {
      label: "Credit",
      key: "creditLedger",
    },
    {
      label: "Amount",
      key: "totalDebit",
      type: "currency",
    },
  ],
};

const formatAmount = (amount = 0) =>
  `₹ ${Number(amount).toLocaleString("en-IN")}`;

export default function VoucherCard({
  type,
  index,
  voucher,
  onView,
  onEdit,
  onPost,
  onDelete,
  onCancel,
  onPrint,
}) {
  const fields = FIELD_MAP[type] || [];
  return (
    <div
    //   onClick={() => onView?.(voucher)}
    key={index}
      className="rounded-xl border bg-white shadow-sm transition hover:shadow-md cursor-pointer"
    >
      {/* Header */}

      <div className="flex items-start justify-between border-b p-4">
        <div>
          <h2 className="font-semibold text-gray-900">{voucher.voucherNo}</h2>

          <p className="mt-1 text-xs text-gray-500">
            {new Date(voucher.date).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              statusColor[voucher.status]
            }`}
          >
            {voucher.status}
          </span>

          <span
            className={`rounded-full px-2 py-1 text-xs ${
              typeColor[voucher.type]
            }`}
          >
            {voucher.type}
          </span>
        </div>
      </div>

      {/* Details */}

      <div className="space-y-3 p-4">
        {fields.map((field) => (
          <div
            key={field.key}
            className="flex items-start justify-between gap-4"
          >
            <span className="text-sm text-gray-500">{field.label}</span>

            <span className="text-right text-sm font-medium">
              {field.type === "currency"
                ? formatAmount(voucher[field.key])
                : voucher[field.key] || "-"}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between border-t bg-gray-50 px-4 py-3"
      >
        <button
          onClick={() => onView?.(voucher)}
          className="flex items-center gap-2 text-sm text-blue-600"
        >
          <FiEye />
          View
        </button>

        <div className="flex items-center gap-2">
          {voucher.status === "DRAFT" && (
            <>
              <IconButton
                icon={<FiEdit2 />}
                color="text-blue-600"
                onClick={() => onEdit?.(voucher)}
              />

              <IconButton
                icon={<FiCheck />}
                color="text-green-600"
                onClick={() => onPost?.(voucher)}
              />

              <IconButton
                icon={<FiTrash2 />}
                color="text-red-600"
                onClick={() => onDelete?.(voucher)}
              />
            </>
          )}

          {voucher.status === "POSTED" && (
            <>
              <IconButton
                icon={<FiPrinter />}
                onClick={() => onPrint?.(voucher)}
              />

              <IconButton
                icon={<FiXCircle />}
                color="text-red-600"
                onClick={() => onCancel?.(voucher)}
              />
            </>
          )}

          <FiArrowRight className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

function IconButton({ icon, onClick, color = "text-gray-700" }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-2 transition hover:bg-gray-200 ${color}`}
    >
      {icon}
    </button>
  );
}
