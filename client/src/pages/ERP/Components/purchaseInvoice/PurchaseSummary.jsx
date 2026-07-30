import { ReceiptIndianRupee } from "lucide-react";

const formatAmount = (value = 0) =>
  Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Row = ({ label, value, bold = false, className = "" }) => (
  <div
    className={`flex items-center justify-between py-2 ${
      bold ? "font-semibold" : ""
    } ${className}`}
  >
    <span className="text-gray-600">{label}</span>

    <span className="text-right">₹ {formatAmount(value)}</span>
  </div>
);

const PurchaseSummary = ({ summary = {} }) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}

      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <ReceiptIndianRupee size={20} className="text-blue-600" />

          <div>
            <h2 className="text-lg font-semibold">Purchase Summary</h2>

            <p className="text-sm text-gray-500">Calculated totals</p>
          </div>
        </div>
      </div>

      {/* Summary */}

      <div className="space-y-1 p-5">
        <Row label="Subtotal" value={summary.subTotal} />

        <Row label="Discount" value={summary.discount} />

        <Row label="Taxable Amount" value={summary.taxableAmount} bold />

        <hr />

        <Row label="CGST" value={summary.cgst} />

        <Row label="SGST" value={summary.sgst} />

        <Row label="IGST" value={summary.igst} />

        <Row label="CESS" value={summary.cess} />

        <hr />

        <Row label="Additional Charges" value={summary.chargeTotal} />

        <Row label="Round Off" value={summary.roundOff} />

        <hr />

        <div className="mt-4 rounded-xl bg-blue-600 p-5 text-white">
          <p className="text-sm opacity-80">Grand Total</p>

          <h1 className="mt-1 text-3xl font-bold">
            ₹ {Number(summary.grandTotal || 0).toLocaleString("en-IN")}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSummary;
