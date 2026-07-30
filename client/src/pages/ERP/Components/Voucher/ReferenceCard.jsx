import {
  FiCalendar,
  FiHash,
  FiFolder,
  FiMapPin,
  FiPackage,
  FiClipboard,
  FiUser,
  FiBook,
} from "react-icons/fi";

export default function ReferenceCard({ voucher }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}

      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Reference Information
        </h2>
      </div>

      {/* Body */}

      <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Info
          icon={<FiCalendar />}
          title="Voucher Date"
          value={formatDate(voucher?.date)}
        />

        <Info
          icon={<FiHash />}
          title="Reference No."
          value={voucher?.reference}
        />

        <Info
          icon={<FiMapPin />}
          title="Project / Site"
          value={voucher?.references}
        />

        <Info
          icon={<FiFolder />}
          title="Cost Center"
          value={voucher?.costCenter?.name}
        />

        <Info
          icon={<FiClipboard />}
          title="Purchase Order"
          value={voucher?.references}
        />

        <Info
          icon={<FiPackage />}
          title="GRN"
          value={voucher?.references}
        />

        <Info icon={<FiBook />} title="Voucher Type" value={voucher?.type} />

        <Info icon={<FiUser />} title="Created By" value={voucher?.createdBy?.userName} />
      </div>
    </div>
  );
}

function Info({ icon, title, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-slate-100 p-3 text-slate-700">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {title}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
