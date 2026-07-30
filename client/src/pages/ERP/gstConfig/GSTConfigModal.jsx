import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useSelector } from "react-redux";

const gstRates = [0, 5, 12, 18, 28];
const ledgerPath = (section, state, field) => `${section}.${state}.${field}`;

const getStateRates = (rate = 0) => {
  const gstRate = Number(rate);

  return {
    cgstRate: gstRate / 2,
    sgstRate: gstRate / 2,
    igstRate: gstRate,
  };
};

export default function GSTConfigModal({
  editing,
  form,
  setForm,
  onClose,
  onSave,
}) {
  const [ledgers, setLedgers] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [company, setCompany] = useState([]);

  const fetchLedgers = async () => {
    const res = await axios.get("/api/v1/ledger", {
      params: { companyId: user.companyId, search: "GST" },
    });
    console.log(res.data.data);
    setLedgers(res.data.data);
    // setFiltered(res.data.data);
  };
  const fetchCompany = async () => {
    const res = await axios.get("/api/v1/company");
    // console.log(res.data);
    setCompany(res.data);
  };

  useEffect(() => {
    fetchLedgers();
    fetchCompany();
  }, []);

  const updateField = (path, value) => {
    const keys = path.split(".");

    const updated = structuredClone(form);

    let current = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;

    setForm(updated);
  };

  const handleRateChange = (rate) => {
    rate = Number(rate);

    const { cgstRate, sgstRate, igstRate } = getStateRates(rate);

    setForm((prev) => ({
      ...prev,

      rate,

      purchase: {
        ...prev.purchase,

        intraState: {
          ...prev.purchase.intraState,
          cgstRate,
          sgstRate,
        },

        interState: {
          ...prev.purchase.interState,
          igstRate,
        },
      },

      sales: {
        ...prev.sales,

        intraState: {
          ...prev.sales.intraState,
          cgstRate,
          sgstRate,
        },

        interState: {
          ...prev.sales.interState,
          igstRate,
        },
      },
    }));
  };

  const LedgerSelect = ({ value, onChange }) => (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-md px-3 py-2"
    >
      <option value="">Select Ledger</option>

      {ledgers.map((ledger) => (
        <option key={ledger._id} value={ledger._id}>
          {ledger.name}
        </option>
      ))}
    </select>
  );

  const companyOptions = company.map((c) => ({
    label: c.name,
    value: c._id,
  }));

  return (
    <div className="space-y-8">
      {/* Basic */}

      <div className="grid grid-cols-2 gap-4">
        {/* COMPANY */}
        <div>
          <label className="text-sm font-medium">Company</label>
          <Select
            options={companyOptions}
            value={companyOptions.find((c) => c.value === form.companyId)}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                companyId: e?.value || "",
              }))
            }
            placeholder="Company"
          />
        </div>

        <div>
          <label className="text-sm font-medium">GST Type</label>

          <select
            className="w-full border rounded-md px-3 py-2"
            value={form.gstType}
            onChange={(e) =>
              setForm({
                ...form,
                gstType: e.target.value,
              })
            }
          >
            <option value="GOODS">Goods</option>
            <option value="SERVICE">Service</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">GST Rate</label>

          <select
            className="w-full border rounded-md px-3 py-2 mt-1"
            value={form.rate}
            onChange={(e) => handleRateChange(e.target.value)}
          >
            {gstRates.map((rate, index) => (
              <option key={index} value={rate}>
                {rate}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Purchase */}

      <div className="border rounded-lg p-5">
        <h3 className="font-semibold mb-4">Purchase Ledger Mapping</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Input CGST</label>

            <LedgerSelect
              value={form.purchase?.intraState.cgstLedgerId}
              onChange={(value) =>
                updateField(
                  ledgerPath("purchase", "intraState", "cgstLedgerId"),
                  value,
                )
              }
            />
          </div>

          <div>
            <label>Input SGST</label>

            <LedgerSelect
              value={form.purchase.intraState.sgstLedgerId}
              onChange={(value) =>
                updateField(
                  ledgerPath("purchase", "intraState", "sgstLedgerId"),
                  value,
                )
              }
            />
          </div>

          <div>
            <label>Input IGST</label>

            <LedgerSelect
              value={form.purchase.interState.igstLedgerId}
              onChange={(value) =>
                updateField(
                  ledgerPath("purchase", "interState", "igstLedgerId"),
                  value,
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Sales */}

      <div className="border rounded-lg p-5">
        <h3 className="font-semibold mb-4">Sales Ledger Mapping</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Output CGST</label>

            <LedgerSelect
              value={form.sales.intraState.cgstLedgerId}
              onChange={(value) =>
                updateField(
                  ledgerPath("sales", "intraState", "cgstLedgerId"),
                  value,
                )
              }
            />
          </div>

          <div>
            <label>Output SGST</label>

            <LedgerSelect
              value={form.sales.intraState.sgstLedgerId}
              onChange={(value) =>
                updateField(
                  ledgerPath("sales", "intraState", "sgstLedgerId"),
                  value,
                )
              }
            />
          </div>

          <div>
            <label>Output IGST</label>

            <LedgerSelect
              value={form.sales.interState.igstLedgerId}
              onChange={(value) =>
                updateField(
                  ledgerPath("sales", "interState", "igstLedgerId"),
                  value,
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={onSave}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}
