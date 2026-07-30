import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { calculateGST } from "../../../../helper/gstEngine";

const initialItem = {
  itemType: "",

  itemId: "",

  purchaseLedgerId: "",

  inventoryLedgerId: "",

  issueLedgerId: "",

  itemName: "",

  description: "",

  hsnSac: "",

  quantity: 1,

  unit: "",

  rate: 0,

  discount: 0,

  taxableAmount: 0,

  cgstRate: 0,
  sgstRate: 0,
  igstRate: 0,

  cgstAmount: 0,
  sgstAmount: 0,
  igstAmount: 0,

  amount: 0,
};

const AddItemDialog = ({
  open,
  setOpen,
  editingItem,
  companyState,
  partyState,

  stockItems = [],

  onAddItem,
  onUpdateItem,
}) => {
  const [item, setItem] = useState(initialItem);

  useEffect(() => {
    if (editingItem) {
      const { index, ...rest } = editingItem;
      setItem(rest);
    } else {
      setItem(initialItem);
    }
  }, [editingItem]);

  const selectStock = (id) => {
    const stock = stockItems.find((i) => i._id === id);

    if (!stock) return;

    setItem({
      itemType: stock.itemType,

      itemId: stock._id,

      purchaseLedgerId: stock.purchaseLedgerId,

      inventoryLedgerId: stock.inventoryLedgerId,

      issueLedgerId: stock.issueLedgerId,

      itemName: stock.name,

      description: stock.description || "",

      hsnSac: stock.code || "",

      unit: stock.unit || "",

      quantity: 1,

      rate: Number(stock.defaultPurchaseRate || 0),

      discount: 0,

      taxableAmount: 0,

      gstRate: Number(stock.gstRate || 0),

      cgstRate: 0,

      sgstRate: 0,

      igstRate: 0,

      cgstAmount: 0,

      sgstAmount: 0,

      igstAmount: 0,

      amount: 0,
    });
  };

  useEffect(() => {
    const gross = Number(item.quantity) * Number(item.rate);

    const discount = Number(item.discount);

    const taxable = gross - discount;

    const gst = calculateGST({
      taxableAmount: taxable,
      gstRate: item.gstRate,
      companyState,
      partyState,
    });

    setItem((prev) => ({
      ...prev,

      taxableAmount: taxable,

      cgstRate: gst.cgstRate,
      sgstRate: gst.sgstRate,
      igstRate: gst.igstRate,

      cgstAmount: gst.cgstAmount,
      sgstAmount: gst.sgstAmount,
      igstAmount: gst.igstAmount,

      amount: gst.total,
    }));
  }, [
    item.quantity,
    item.rate,
    item.discount,
    item.cgstRate,
    item.sgstRate,
    item.igstRate,
  ]);

  const saveItem = () => {
    if (!item.itemId) {
      alert("Select Item");
      return;
    }

    if (item.quantity <= 0) {
      alert("Quantity should be greater than zero");
      return;
    }

    if (item.rate <= 0) {
      alert("Rate should be greater than zero");
      return;
    }

    const payload = {
      ...item,
    };

    if (editingItem && editingItem.index !== undefined) {
      onUpdateItem(editingItem.index, payload);
    } else {
      onAddItem(payload);
    }

    setOpen(false);

    setItem(initialItem);
  };

  if (!open) return null;

  return (
    <div>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 h-full p-8">
        <div className="bg-white p-2 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-fit max-h-[75vh] md:h-[80vh] lg:h-[85vh]  overflow-auto">
          {/* Header */}

          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">
              {editingItem ? "Edit Item" : "Add Item"}
            </h2>

            <button
              onClick={() => {
                setItem(initialItem);
                setOpen(false);
              }}
            >
              <X />
            </button>
          </div>

          {/* Body */}

          <div className="space-y-5 p-5">
            {/* Stock */}

            <div>
              <label className="mb-1 block text-sm">Item</label>

              <Select
                placeholder="Select Item*"
                options={stockItems.map((i) => ({
                  value: i._id,
                  label: `${i.name}`,
                }))}
                value={
                  stockItems
                    .map((i) => ({
                      value: i._id,
                      label: `${i.name}`,
                    }))
                    .find((i) => String(i.value) === String(item.itemId)) ||
                  null
                }
                onChange={(v) => {
                  if (!v) {
                    setItem(initialItem);
                    return;
                  }
                  selectStock(v.value);
                }}
                isClearable
              />
            </div>

            {/* Qty Rate */}

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label>Qty</label>

                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    setItem((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label>Rate</label>

                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) =>
                    setItem((prev) => ({
                      ...prev,
                      rate: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label>Discount</label>

                <input
                  type="number"
                  value={item.discount}
                  onChange={(e) =>
                    setItem((prev) => ({
                      ...prev,
                      discount: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>

            {/* Unit */}
            <div>
              <label>Unit</label>

              <input
                value={item.unit}
                disabled
                className="w-full rounded-lg border bg-gray-100 px-3 py-2"
              />
            </div>

            {/* HSN CODE */}
            <div>
              <label>HSN/SAC</label>

              <input
                value={item.hsnSac}
                disabled
                className="w-full rounded-lg border bg-gray-100 px-3 py-2"
              />
            </div>

            {/* GST */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label>CGST %</label>

                <input
                  value={item.cgstRate}
                  disabled
                  className="w-full rounded border bg-gray-100 px-3 py-2"
                />
              </div>

              <div>
                <label>SGST %</label>

                <input
                  value={item.sgstRate}
                  disabled
                  className="w-full rounded border bg-gray-100 px-3 py-2"
                />
              </div>

              <div>
                <label>IGST %</label>

                <input
                  value={item.igstRate}
                  disabled
                  className="w-full rounded border bg-gray-100 px-3 py-2"
                />
              </div>
            </div>

            {/* Description */}

            <textarea
              rows={3}
              value={item.description}
              onChange={(e) =>
                setItem((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-lg border p-3"
              placeholder="Description..."
            />

            {/* Summary */}

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between py-1">
                <span>Taxable</span>

                <span>
                  ₹ {Number(item.taxableAmount).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span>CGST</span>

                <span>₹ {item.cgstAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between py-1">
                <span>SGST</span>

                <span>₹ {item.sgstAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between py-1">
                <span>IGST</span>

                <span>₹ {item.igstAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-2 flex justify-between border-t pt-2 text-lg font-semibold">
                <span>Total</span>

                <span>₹ {Number(item.amount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 border-t p-4">
            <button
              onClick={() => {
                setItem(initialItem);
                setOpen(false);
              }}
              className="rounded-lg border px-5 py-2"
            >
              Cancel
            </button>

            <button
              onClick={saveItem}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white"
            >
              Save Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemDialog;
