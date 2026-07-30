import { Plus, Trash2 } from "lucide-react";
import Select from "react-select";

const PurchaseCharges = ({
  charges = [],
  ledgers = [],
  readonly = false,

  onAddCharge,
  onUpdateCharge,
  onDeleteCharge,
}) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">Additional Charges</h2>

          <p className="text-sm text-gray-500">
            Freight, Loading, Insurance etc.
          </p>
        </div>

        {!readonly && (
          <button
            onClick={onAddCharge}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            <Plus size={18} />
            Add Charge
          </button>
        )}
      </div>

      {charges.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          No Additional Charges
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {charges.map((charge, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-lg border p-4 md:grid-cols-9"
            >
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">Ledger</label>

                <Select
                  placeholder="Select Charges Ledger*"
                  options={ledgers.map((i) => ({
                    value: i._id,
                    label: `${i.name}`,
                  }))}
                  value={
                    ledgers
                      .map((i) => ({
                        value: i._id,
                        label: `${i.name}`,
                      }))
                      .find(
                        (i) => String(i.value) === String(charge.ledgerId),
                      ) || null
                  }
                  onChange={(l) => onUpdateCharge(index, "ledgerId", l.value)}
                  disabled={readonly}
                  isClearable
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">Charge Name</label>

                <input
                  value={charge.name}
                  disabled={readonly}
                  onChange={(e) =>
                    onUpdateCharge(index, "name", e.target.value)
                  }
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Freight"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">Amount</label>

                <input
                  type="number"
                  value={charge.amount}
                  disabled={readonly}
                  onChange={(e) =>
                    onUpdateCharge(index, "amount", Number(e.target.value))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="md:col-span-2 flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={charge.affectsInventoryCost}
                    disabled={readonly}
                    onChange={(e) =>
                      onUpdateCharge(
                        index,
                        "affectsInventoryCost",
                        e.target.checked,
                      )
                    }
                  />

                  <span className="text-sm">Include in Inventory Cost</span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2 md:col-span-2">
                <input
                  type="number"
                  placeholder="CGST"
                  value={charge.cgstRate}
                  disabled={readonly}
                  onChange={(e) =>
                    onUpdateCharge(index, "cgstRate", Number(e.target.value))
                  }
                  className="rounded border px-2 py-2"
                />

                <input
                  type="number"
                  placeholder="SGST"
                  value={charge.sgstRate}
                  disabled={readonly}
                  onChange={(e) =>
                    onUpdateCharge(index, "sgstRate", Number(e.target.value))
                  }
                  className="rounded border px-2 py-2"
                />

                <input
                  type="number"
                  placeholder="IGST"
                  value={charge.igstRate}
                  disabled={readonly}
                  onChange={(e) =>
                    onUpdateCharge(index, "igstRate", Number(e.target.value))
                  }
                  className="rounded border px-2 py-2"
                />
              </div>

              {!readonly && (
                <div className="flex items-end md:col-span-1">
                  <button
                    onClick={() => onDeleteCharge(index)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseCharges;
