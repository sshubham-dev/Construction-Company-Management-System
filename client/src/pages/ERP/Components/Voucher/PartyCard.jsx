import { FiUser, FiPhone, FiMapPin, FiFileText } from "react-icons/fi";

const TITLE = {
  PURCHASE: "Supplier Information",
  SALES: "Client Information",
  RECEIPT: "Received From",
  PAYMENT: "Paid To",
  JOURNAL: "Ledger Information",
  CONTRA: "Account Information",
};

export default function PartyCard({ type, party = {} }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}

      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {TITLE[type] || "Party Information"}
        </h2>
      </div>

      {/* Body */}

      <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Info
          icon={<FiUser />}
          title={
            type === "SALES"
              ? "Client"
              : type === "PURCHASE"
                ? "Supplier"
                : "Party"
          }
          value={party.name}
        />

        <Info icon={<FiPhone />} title="Phone" value={party.phone} />

        <Info icon={<FiFileText />} title="GST No." value={party.gst} />

        <Info icon={<FiMapPin />} title="Address" value={party.address} />
      </div>
    </div>
  );
}

function Info({ icon, title, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-blue-50 p-3 text-blue-600">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {title}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
