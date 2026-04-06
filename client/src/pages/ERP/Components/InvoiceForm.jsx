import { useEffect, useMemo, useState } from "react";
import { ToWords } from "to-words";
import { Plus, Trash2, Search } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "../../../pdf/InvoicePdf";

const toWords = new ToWords({ localeCode: "en-IN" });

// Mock data (replace with API)
const BUSINESS_UNITS = [
  {
    _id: "1",
    name: "Bhuvi Consultants",
    address: "Ranchi, Jharkhand",
    gstin: "20XXXXX1234X1Z5",
    state: "Jharkhand",
  },
  {
    _id: "2",
    name: "Bhuvi Interiors",
    address: "Ranchi, Jharkhand",
    gstin: "20YYYYY1234Y1Z5",
    state: "Jharkhand",
  },
];

const CLIENTS = [
  {
    _id: "c1",
    name: "Shubham Kumar",
    gstin: "22AAAAA0000A1Z5",
    email: "shubham@example.com",
    address: "Rd no 5, Ranchi",
    shipping: "",
    state: "Jharkhand",
  },
  {
    _id: "c2",
    name: "ABC Pvt Ltd",
    gstin: "27BBBBB0000B1Z5",
    email: "abc@example.com",
    address: "Mumbai",
    shipping: "",
    state: "Maharashtra",
  },
];

function inWords(n) {
  if (!n || isNaN(n)) return "Zero rupees only"; // ✅ safety

  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const f = (num) => {
    if (!num || isNaN(num)) return ""; // ✅ critical fix

    if (num < 20) return a[num];
    if (num < 100)
      return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
    if (num < 1000)
      return (
        a[Math.floor(num / 100)] +
        " hundred" +
        (num % 100 ? " " + f(num % 100) : "")
      );
    if (num < 100000)
      return (
        f(Math.floor(num / 1000)) +
        " thousand" +
        (num % 1000 ? " " + f(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        f(Math.floor(num / 100000)) +
        " lakh" +
        (num % 100000 ? " " + f(num % 100000) : "")
      );

    return (
      f(Math.floor(num / 10000000)) +
      " crore" +
      (num % 10000000 ? " " + f(num % 10000000) : "")
    );
  };

  return (f(Math.round(n)) + " rupees only").replace(/^./, (c) =>
    c.toUpperCase(),
  );
}

const InvoiceForm = () => {
  const [invoice, setInvoice] = useState({
    invoiceNo: "",
    date: "",
    dueDate: "",
    business: {
      id: "",
      name: "",
      gstin: "",
      address: "",
      state: "",
      logo: {
        url: "",
        public_url: "",
      },
    },
    placeOfSupply: "",
    taxType: "gst",
    interState: false,
    client: {
      id: "",
      name: "",
      gstin: "",
      email: "",
      address: "",
      shipping: "",
      state: "",
    },
    items: [
      {
        desc: "",
        code: "",
        unit: "Nos",
        qty: 1,
        rate: 0,
        gstRate: 18,
        amount: 0,
      },
    ],
    subTotal: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    totalAmount: 0,
    amountInWords: "",
    notes: "",
    terms: "Payment due within 30 days.",
    status: "unpaid",
  });
  const [clients, setClients] = useState([]);
  const [businesses, setBusinesses] = useState([]);

  const nextInv = () => {
    const y = new Date().getFullYear();
    const fy = `${y}-${String(y + 1).slice(-2)}`;
    const c = parseInt(localStorage.getItem("invCount") || "0") + 1;
    localStorage.setItem("invCount", c);
    return `INV-${fy}-${String(c).padStart(3, "0")}`;
  };
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setInvoice((p) => ({ ...p, invoiceNo: nextInv(), date: today }));
  }, []);

  const selectClient = (id) => {
    const c = CLIENTS.find((x) => x._id === id);
    if (!c) return;
    setInvoice((p) => ({
      ...p,
      client: {
        id: c?._id,
        name: c?.name,
        gstin: c?.gstin,
        email: c?.email,
        address: c?.address,
        state: c?.state,
      },
    }));
  };

  const selectBusiness = (id) => {
    const b = BUSINESS_UNITS.find((x) => x._id === id);
    if (!b) return;
    setInvoice((p) => ({
      ...p,
      business: {
        id: b?._id,
        name: b?.name,
        gstin: b?.gstin,
        address: b?.address,
        state: b?.state,
      },
    }));
  };

  const setClientField = (k, v) => {
    setInvoice((p) => ({ ...p, client: { ...p.client, [k]: v } }));
  };

  const setBusinessField = (k, v) => {
    setInvoice((p) => ({ ...p, business: { ...p.business, [k]: v } }));
  };

  const setItem = (i, k, v) => {
    const items = [...invoice.items];
    items[i][k] = v;
    setInvoice((p) => ({ ...p, items }));
  };

  const addItem = () =>
    setInvoice((p) => ({
      ...p,
      items: [
        ...p.items,
        { desc: "", hsn: "", unit: "Nos", qty: 1, rate: 0, gstRate: 18 },
      ],
    }));

  const removeItem = (i) =>
    setInvoice((p) => ({
      ...p,
      items:
        p.items.length > 1 ? p.items.filter((_, idx) => idx !== i) : p.items,
    }));

  const subtotal = useMemo(
    () => invoice.items.reduce((s, i) => s + i.qty * i.rate, 0),
    [invoice.items],
  );

  const gst = invoice.items.length ? invoice.items[0].gstRate : 0; // single rate selector per doc
  const sameState =
    invoice.business?.state &&
    invoice.client.state &&
    invoice.business.state === invoice.client.state;

  useEffect(() => {
    let cgst = 0,
      sgst = 0,
      igst = 0;

    if (invoice.taxType === "gst") {
      if (invoice.interState || !sameState) {
        igst = (subtotal * gst) / 100;
      } else {
        cgst = (subtotal * gst) / 200;
        sgst = (subtotal * gst) / 200;
      }
    }

    setInvoice((p) => ({
      ...p,
      cgst,
      sgst,
      igst,
    }));
  }, [subtotal, gst, invoice.interState, invoice.taxType, sameState]);

  const total = subtotal + invoice.cgst + invoice.sgst + invoice.igst;
  const totalSafe = isNaN(total) ? 0 : total;

  const currency = (n) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setInvoice((p) => ({
        ...p,
        subTotal: subtotal,
        totalAmount: total,
        amountInWords: inWords(total),
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6"
      >
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">GST Invoice Generator</h1>
          <div className="flex gap-2">
            {/* <button className="px-4 py-2 border rounded">Save</button> */}
            <PDFDownloadLink
              document={<InvoicePDF data={invoice} />}
              fileName={invoice.invoiceNo}
            >
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Download PDF
              </button>
            </PDFDownloadLink>
          </div>
        </div>

        {/* Dates + IGST */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            className="border p-2"
            value={invoice.invoiceNo}
            onChange={(e) =>
              setInvoice({ ...invoice, invoiceNo: e.target.value })
            }
          />
          <input
            type="date"
            className="border p-2"
            value={invoice.date}
            onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
          />
          {/* <input
            type="date"
            className="border p-2"
            value={invoice.dueDate}
            onChange={(e) =>
              setInvoice({ ...invoice, dueDate: e.target.value })
            }
            placeholder="Due Date"
          /> */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={invoice.interState}
              onChange={(e) =>
                setInvoice({ ...invoice, interState: e.target.checked })
              }
            />{" "}
            Inter-State Transaction (IGST)
          </label>
        </div>

        {/* Business */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Business Details</h3>
          <select
            className="border p-2 w-full mb-2"
            value={invoice.business.id}
            onChange={(e) => selectBusiness(e.target.value)}
          >
            {BUSINESS_UNITS.map((b, index) => (
              <option key={index} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2"
              value={invoice.business?.gstin || ""}
              onChange={(e) => setBusinessField("gstin", e.target.value)}
              readOnly
            />
            <input
              className="border p-2"
              value={invoice.business?.state || ""}
              onChange={(e) => setBusinessField("state", e.target.value)}
              readOnly
            />
          </div>
          <textarea
            className="border p-2 w-full mt-2"
            value={invoice.business?.address || ""}
            onChange={(e) => setBusinessField("address", e.target.value)}
            readOnly
          />
        </div>

        {/* Customer */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Customer Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="border p-2"
              value={invoice.client.id}
              onChange={(e) => selectClient(e.target.value)}
            >
              <option value="">Select client</option>
              {CLIENTS.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="border p-2"
              placeholder="Email"
              value={invoice.client.email}
              onChange={(e) => setClientField("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <input
              className="border p-2"
              placeholder="GSTIN"
              value={invoice.client.gstin}
              onChange={(e) => setClientField("gstin", e.target.value)}
              readOnly
            />
            <input
              className="border p-2"
              placeholder="State"
              value={invoice.client.state}
              onChange={(e) => setClientField("state", e.target.value)}
            />
          </div>
          <textarea
            className="border p-2 w-full mt-2"
            placeholder="Billing Address"
            value={invoice.client.address}
            onChange={(e) => setClientField("address", e.target.value)}
          />
          <textarea
            className="border p-2 w-full mt-2"
            placeholder="Shipping Address"
            value={invoice.client.shipping}
            onChange={(e) => setClientField("shipping", e.target.value)}
          />
        </div>

        {/* Items */}
        <div className="mb-6 bg-gray-50 p-5 rounded-xl border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Invoice Items</h3>
            <button
              onClick={addItem}
              className="flex items-center gap-2 text-blue-600 font-medium"
            >
              + Add Item
            </button>
          </div>

          {/* Header Row */}
          <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-600 mb-2 px-2">
            <div className="col-span-4">Description *</div>
            <div className="col-span-2">HSN Code</div>
            <div className="col-span-1">Qty *</div>
            <div className="col-span-2">Unit Price *</div>
            <div className="col-span-1">GST %</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {invoice.items.map((it, i) => {
              const amt = it.qty * it.rate;
              return (
                <div key={i} className="bg-white border rounded-xl p-3">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <input
                      className="col-span-4 border p-2 rounded"
                      placeholder="Item description"
                      value={it.desc}
                      onChange={(e) => setItem(i, "desc", e.target.value)}
                    />

                    <input
                      className="col-span-2 border p-2 rounded"
                      placeholder="HSN"
                      value={it.code}
                      onChange={(e) => setItem(i, "code", e.target.value)}
                    />

                    <input
                      type="number"
                      className="col-span-1 border p-2 rounded"
                      value={it.qty}
                      onChange={(e) => setItem(i, "qty", +e.target.value)}
                    />

                    <input
                      type="number"
                      className="col-span-2 border p-2 rounded"
                      value={it.rate}
                      onChange={(e) => setItem(i, "rate", +e.target.value)}
                    />

                    <input
                      type="number"
                      className="col-span-1 border p-2 rounded w-full"
                      value={it.gst}
                      onChange={(e) => setItem(i, "gst", +e.target.value)}
                    />

                    <div className="col-span-2 flex justify-end items-center gap-3">
                      <span className="font-medium text-gray-800">
                        ₹{currency(amt)}
                      </span>
                      {invoice.items.length > 1 && (
                        <button
                          onClick={() => removeItem(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Additional Info</h3>
            <textarea
              className="border p-2 w-full mb-2"
              placeholder="Notes"
              value={invoice.notes}
              onChange={(e) =>
                setInvoice({ ...invoice, notes: e.target.value })
              }
            />
            <textarea
              className="border p-2 w-full"
              placeholder="Terms & Conditions"
              value={invoice.terms}
              onChange={(e) =>
                setInvoice({ ...invoice, terms: e.target.value })
              }
            />
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Tax Summary</h3>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{currency(subtotal)}</span>
            </div>
            {invoice?.igst > 0 && (
              <div className="flex justify-between">
                <span>IGST ({gst}%)</span>
                <span>₹{currency(invoice?.igst)}</span>
              </div>
            )}
            {invoice?.cgst > 0 && (
              <div className="flex justify-between">
                <span>CGST ({gst / 2}%)</span>
                <span>₹{currency(invoice?.cgst)}</span>
              </div>
            )}
            {invoice?.sgst > 0 && (
              <div className="flex justify-between">
                <span>SGST ({gst / 2}%)</span>
                <span>₹{currency(invoice?.sgst)}</span>
              </div>
            )}
            <div className="border-t my-2" />
            <div className="flex justify-between font-bold">
              <span>Grand Total</span>
              <span>₹{currency(totalSafe)}</span>
            </div>
            <p className="text-xs mt-2 text-gray-600">{inWords(totalSafe)}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 border rounded">Cancel</button>
          <button type="" className="px-4 py-2 border rounded">Save Invoice</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Save & Download PDF
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
