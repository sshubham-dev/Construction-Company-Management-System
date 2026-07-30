const STATUS_STYLES = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-amber-100 text-amber-700 border-amber-200",
  },

  POSTED: {
    label: "Posted",
    className:
      "bg-green-100 text-green-700 border-green-200",
  },

  PENDING: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700 border-yellow-200",
  },

  APPROVED: {
    label: "Approved",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
  },

  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-700 border-red-200",
  },

  CANCELLED: {
    label: "Cancelled",
    className:
      "bg-red-100 text-red-700 border-red-200",
  },

  PAID: {
    label: "Paid",
    className:
      "bg-blue-100 text-blue-700 border-blue-200",
  },

  UNPAID: {
    label: "Unpaid",
    className:
      "bg-gray-100 text-gray-700 border-gray-200",
  },

  PARTIAL: {
    label: "Partial",
    className:
      "bg-orange-100 text-orange-700 border-orange-200",
  },

  ACTIVE: {
    label: "Active",
    className:
      "bg-green-100 text-green-700 border-green-200",
  },

  INACTIVE: {
    label: "Inactive",
    className:
      "bg-gray-100 text-gray-700 border-gray-200",
  },

  COMPLETED: {
    label: "Completed",
    className:
      "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
};

const StatusBadge = ({
  status,
  size = "sm",
}) => {
  const badge =
    STATUS_STYLES[status] || {
      label: status,
      className:
        "bg-gray-100 text-gray-700 border-gray-200",
    };

  const sizeClass =
    size === "lg"
      ? "px-3 py-1.5 text-sm"
      : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${badge.className}`}
    >
      {badge.label}
    </span>
  );
};

export default StatusBadge;