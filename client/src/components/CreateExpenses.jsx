import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

const ExpenseForm = ({ onClose, editId, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [ledgers, setLedgers] = useState([]);
  // const [expenseLedgers, setExpenseLedgers] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [form, setForm] = useState({
    date: "",
    amount: "",
    narration: "",
    expenseLedger: "",
    expenseFor: null,
    attachments: [],
  });
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [preview, setPreview] = useState([]); // array of { url, type }

  /* ---------------------------------- LOAD LEDGERS ---------------------------------- */
  useEffect(() => {
    const loadLedgers = async () => {
      const { data } = await axios.get("/api/v1/ledger", {
        params: { companyId: user.companyId },
      });
      // console.log(data);
      // Site / Store / Office ledgers
      setLedgers(data.data);
    };
    const fetchCostCenter = async () => {
      try {
        const { data } = await axios.get("/api/v1/cost-center", {
          params: { companyId: user.companyId },
        });
        // console.log(data);
        setCostCenters(data);
      } catch (error) {
        console.log(error);
      }
    };
    loadLedgers();
    fetchCostCenter();
  }, []);

  /* ---------------------------------- EDIT MODE ---------------------------------- */
  useEffect(() => {
    if (!editId) return;

    const loadExpense = async () => {
      const { data } = await axios.get(`/api/v1/expenses/${editId}`);
      console.log(data);
      setForm({
        date: data.date?.slice(0, 10),
        amount: data.amount,
        narration: data.narration,
        expenseLedger: data.expenseLedger?._id || data.expenseLedger || "",
        expenseFor: data.expenseFor?._id || data.expenseFor || null,
        attachments: [...(data?.attachments || null)],
      });

      if (data.attachments?.[0]?.url) {
        setPreview(data.attachments[0].url);
      }
    };

    loadExpense();
  }, [editId]);

  const PARTY_UNDER = [
    "Indirect Expenses",
    "Sundry Creditors",
    "Direct Expenses",
    "Marketing Expenses",
    "Office Expenses",
    "Purchase Account",
  ];

  /* ---------------------------------- HANDLERS ---------------------------------- */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const expenseForOptions = useMemo(() => {
    return costCenters.map((l) => ({
      value: l._id,
      label: l.name,
    }));
  }, [costCenters]);

  const expenseLedgerOptions = useMemo(() => {
    return ledgers
      .filter((l) => PARTY_UNDER.includes(l?.groupId?.name))
      .map((l) => ({
        value: l._id,
        label: `${l.name} (${l.referenceType || l?.groupId?.name || l.type})`,
      }));
  }, [ledgers]);

  const handleFile = (e) => {
    const MAX_MB = 5;

    const files = Array.from(e.target.files).filter(
      (f) => f.size / 1024 / 1024 <= MAX_MB,
    );

    if (!files.length) return;

    // store files for FormData
    setForm((prev) => ({
      ...prev,
      attachments: files,
    }));

    // generate local previews
    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.includes("pdf") ? "pdf" : "image",
    }));

    // append previews (important for edit mode)
    setPreview((prev) => [...prev, ...previews]);
  };

  /* ---------------------------------- SUBMIT ---------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();

    fd.append("date", form.date);
    fd.append("amount", form.amount);
    fd.append("narration", form.narration);
    fd.append("expenseLedger", form.expenseLedger);
    fd.append("expenseFor", form.expenseFor || null);

    // ✅ VERY IMPORTANT
    if (form.attachments && form.attachments.length > 0) {
      form.attachments.forEach((file) => {
        fd.append("attachments", file); // exact same key
      });
    }

    console.log(form);
    try {
      if (editId !== undefined) {
        await axios.put(`/api/v1/expenses/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/v1/expenses", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // onSave();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      {/* Expense Ledger */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expense Type
        </label>
        <Select
          options={expenseLedgerOptions}
          value={expenseLedgerOptions.find(
            (o) => o.value === form.expenseLedger || form.expenseLedger?._id,
          )}
          onChange={(opt) =>
            setForm((prev) => ({
              ...prev,
              expenseLedger: opt?.value || "",
            }))
          }
          placeholder="Search Expense Type..."
          isClearable
        />
      </div>

      {/* Expense For */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expense For
        </label>
        <Select
          options={expenseForOptions}
          value={expenseForOptions.find(
            (o) => o.value === form.expenseFor || form.expenseFor?._id,
          )}
          onChange={(opt) =>
            setForm((prev) => ({
              ...prev,
              expenseFor: opt?.value || null,
            }))
          }
          placeholder="Search..."
          isClearable
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      {/* Narration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Narration
        </label>
        <textarea
          name="narration"
          value={form.narration}
          onChange={handleChange}
          required
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Optional description of the expense"
        />
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>

        <input
          type="file"
          name="attachments"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFile}
          className="block w-full text-sm text-gray-600
               file:mr-4 file:rounded-md file:border-0
               file:bg-green-50 file:px-4 file:py-2
               file:text-sm file:font-medium file:text-green-700
               hover:file:bg-green-100"
        />

        <p className="mt-1 text-xs text-gray-500">Upload bill (image or PDF)</p>

        {/* Preview List */}
        {Array.isArray(preview) && preview.length > 0 && (
          <div className="mt-3 space-y-2">
            {preview?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt="Attachments"
                      className="h-12 w-12 rounded object-cover border"
                    />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center rounded border bg-white text-sm font-medium text-red-600">
                      PDF
                    </div>
                  )}

                  <span className="text-sm text-gray-700">
                    Attachment {idx + 1}
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-gray-400 px-4 py-2 text-sm text-white
                   hover:bg-gray-500"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white
                   hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : editId ? "Update Expense" : "Save Expense"}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
