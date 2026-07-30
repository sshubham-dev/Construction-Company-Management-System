import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useState } from "react";
import AddItemDialog from "./AddItemDialog";

const PurchaseItems = ({
  items = [],
  stockItems = [],
  readonly = false,
  companyState,
  partyState,

  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const removeItem = (index) => {
    if (readonly) return;

    if (!window.confirm("Remove this item?")) return;

    onDeleteItem(index);
  };

  const editItem = (item, index) => {
    setEditingItem({
      ...item,
      index,
    });

    setOpen(true);
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setOpen(true);
  };

  return (
    <>
      <div className="rounded-xl border bg-white shadow-sm">
        {/* Header */}

        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-semibold">Purchase Items</h2>

            <p className="text-sm text-gray-500">
              Add materials, services or assets.
            </p>
          </div>

          {!readonly && (
            <button
              onClick={openAddDialog}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Item
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <Package size={50} className="text-gray-300" />

            <p className="mt-3 text-gray-500">No Purchase Items Added</p>

            {!readonly && (
              <button
                onClick={openAddDialog}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Add First Item
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Item</th>

                  <th className="px-4 py-3 text-center">Qty</th>

                  <th className="px-4 py-3 text-center">Unit</th>

                  <th className="px-4 py-3 text-right">Rate</th>

                  <th className="px-4 py-3 text-right">Taxable</th>

                  <th className="px-4 py-3 text-center">GST</th>

                  <th className="px-4 py-3 text-right">Amount</th>

                  {!readonly && (
                    <th className="px-4 py-3 text-center">Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4 text-right">
                      <div className="font-medium">{item.itemName}</div>

                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>

                      <div className="mt-1 text-xs text-blue-600">
                        HSN : {item.hsnSac || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">{item.quantity}</td>

                    <td className="px-4 py-4 text-right">{item.unit}</td>

                    <td className="px-4 py-4 text-right">
                      ₹ {Number(item.rate).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-4 text-right">
                      ₹ {Number(item.taxableAmount).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-4 text-right text-sm">
                      {Number(item.igstRate) > 0 ? (
                        <span>IGST {item.igstRate}%</span>
                      ) : (
                        <div>
                          <div>CGST {item.cgstRate}%</div>

                          <div>SGST {item.sgstRate}%</div>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right font-semibold">
                      ₹ {Number(item.amount).toLocaleString("en-IN")}
                    </td>

                    {!readonly && (
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => editItem(item, index)}
                            className="rounded p-2 hover:bg-blue-100"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => removeItem(index)}
                            className="rounded p-2 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddItemDialog
        open={open}
        setOpen={setOpen}
        editingItem={editingItem}
        stockItems={stockItems}
        onAddItem={onAddItem}
        onUpdateItem={onUpdateItem}
        companyState={companyState}
        partyState={partyState}
      />
    </>
  );
};

export default PurchaseItems;
