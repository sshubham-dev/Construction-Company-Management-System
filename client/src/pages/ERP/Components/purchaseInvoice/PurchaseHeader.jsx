import { CalendarDays } from "lucide-react";
import Select from "react-select";

const PurchaseHeader = ({
  form,
  onChange,
  suppliers = [],
  stores = [],
  purchaseOrders = [],
  grns = [],
  costCenters = [],
  readonly = false,
}) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Heading */}

      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">Purchase Details</h2>

        <p className="text-sm text-gray-500">
          Supplier and invoice information
        </p>
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Supplier */}
        <div>
          <label className="mb-1 block text-sm font-medium">Supplier *</label>

          <Select
            placeholder="Select Supplier*"
            options={suppliers.map((i) => ({
              value: i._id,
              label: `${i.name}`,
            }))}
            value={
              suppliers
                .map((i) => ({
                  value: i._id,
                  label: `${i.name}`,
                }))
                .find((i) => String(i.value) === String(form.supplierId)) ||
              null
            }
            onChange={(l) => onChange("supplierId", l.value || "")}
            disabled={readonly}
            isClearable
          />
        </div>

        {/* Source */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Purchase Source
          </label>

          <Select
            isDisabled={readonly}
            options={[
              { value: "MANUAL", label: "Manual Purchase" },
              { value: "PO", label: "Purchase Order" },
              { value: "GRN", label: "Goods Receipt Note" },
            ]}
            value={{
              value: form.source,
              label:
                form.source === "GRN"
                  ? "Goods Receipt Note"
                  : form.source === "PO"
                    ? "Purchase Order"
                    : "Manual Purchase",
            }}
            onChange={(e) => onChange("source", e?.value || "MANUAL")}
          />
        </div>

        {/* Store */}
        <div>
          <label className="mb-1 block text-sm font-medium">Store *</label>

          <Select
            placeholder="Select Store"
            isDisabled={readonly}
            options={stores.map((i) => ({
              value: i._id,
              label: i.name,
            }))}
            value={
              stores
                .map((i) => ({
                  value: i._id,
                  label: i.name,
                }))
                .find((i) => String(i.value) === String(form.storeId)) || null
            }
            onChange={(e) => onChange("storeId", e?.value || "")}
            isClearable
          />
        </div>

        {/* Cost Center */}
        <div>
          <label className="mb-1 block text-sm font-medium">Cost Center</label>

          <Select
            placeholder="Select Site/Store*"
            options={costCenters.map((i) => ({
              value: i._id,
              label: `${i.name}`,
            }))}
            value={
              costCenters
                .map((i) => ({
                  value: i._id,
                  label: `${i.name}`,
                }))
                .find((i) => String(i.value) === String(form.costCenterId)) ||
              null
            }
            onChange={(l) => onChange("costCenterId", l.value)}
            disabled={readonly}
            isClearable
          />
        </div>

        {/* Invoice Number */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Supplier Invoice No
          </label>

          <input
            type="text"
            value={form.supplierInvoiceNo}
            disabled={readonly}
            onChange={(e) => onChange("supplierInvoiceNo", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Invoice Number"
          />
        </div>

        {/* Invoice Date */}
        <div>
          <label className="mb-1 block text-sm font-medium">Invoice Date</label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="date"
              value={form.invoiceDate}
              disabled={readonly}
              onChange={(e) => onChange("invoiceDate", e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-3"
            />
          </div>
        </div>

        {/* PO */}
        {form.source !== "MANUAL" && (
          <div>
            <label className="mb-1 block text-sm font-medium">
              Purchase Order
            </label>

            <Select
              isDisabled={readonly}
              placeholder="Select Purchase Order"
              options={purchaseOrders.map((i) => ({
                value: i._id,
                label: i.poNumber,
              }))}
              value={
                purchaseOrders
                  .map((i) => ({
                    value: i._id,
                    label: i.poNumber,
                  }))
                  .find(
                    (i) => String(i.value) === String(form.purchaseOrderId),
                  ) || null
              }
              onChange={(e) => onChange("purchaseOrderId", e?.value || null)}
              isClearable
            />
          </div>
        )}

        {/* GRN */}
        {form.source === "GRN" && (
          <div>
            <label className="mb-1 block text-sm font-medium">GRN</label>

            <Select
              placeholder="Select GRN"
              isDisabled={readonly}
              options={grns.map((i) => ({
                value: i._id,

                label: i.grnNumber,
              }))}
              value={
                grns
                  .map((i) => ({
                    value: i._id,
                    label: i.grnNumber,
                  }))
                  .find((i) => String(i.value) === String(form.grnId)) || null
              }
              onChange={(e) => onChange("grnId", e?.value || null)}
              isClearable
            />
          </div>
        )}

        {/* Due Date */}
        <div>
          <label className="mb-1 block text-sm font-medium">Due Date</label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="date"
              value={form.dueDate}
              disabled={readonly}
              onChange={(e) => onChange("dueDate", e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-3"
            />
          </div>
        </div>

        {/* Payment Terms */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Payment Terms
          </label>

          <input
            type="text"
            value={form.paymentTerms}
            disabled={readonly}
            onChange={(e) => onChange("paymentTerms", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="30 Days"
          />
        </div>

        {/* Narration */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-1 block text-sm font-medium">Narration</label>

          <textarea
            rows={3}
            value={form.narration}
            disabled={readonly}
            onChange={(e) => onChange("narration", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Optional remarks..."
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseHeader;
