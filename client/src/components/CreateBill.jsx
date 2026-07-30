import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";

axios.defaults.withCredentials = true;

const BILL_TYPES = [
  { value: "workorder", label: "Contractor Bill" },
  { value: "extrawork", label: "Extra Work Bill" },
  { value: "supplylabour", label: "Supply Labour Bill" },
];

const CreateBill = ({ onClose, editId = null }) => {
  const { user } = useSelector((s) => s.auth || {});
  const dispatch = useDispatch?.() || (() => {});

  // form state
  const [sites, setSites] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [billType, setBillType] = useState("workorder");
  const [siteId, setSiteId] = useState("");
  const [contractorId, setContractorId] = useState("");
  const [candidates, setCandidates] = useState([]); // items to pick from depending on billType
  const [selectedRef, setSelectedRef] = useState(null); // object representing chosen candidate
  const [toPay, setToPay] = useState("");
  const [loading, setLoading] = useState(false);

  // for edit mode (optional)
  useEffect(() => {
    if (user && user?.department === "Site Incharge") {
      // console.log(user._id);
      getUserSites(user._id);
    } else if (user && user?.department === "Site Supervisor") {
      // console.log(user);
      getUserSites(user._id);
    } else if (user && user?.department === "Client") {
      // console.log(user);
      getUserSites(user._id);
    } else {
      const getSites = async () => {
        try {
          const siteData = await axios.get("/api/v1/site");
          setSites(siteData.data);
          // console.log(siteData.data);
        } catch (error) {
          console.error(error);
          setError(error.message);
        }
      };
      getSites();
    }
  }, []);

  const getUserSites = async (id) => {
    try {
      const siteData = await axios.get(`/api/v1/site/user/${id}`);
      // console.log(siteData.data);
      setSites(siteData.data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // load contractors (global) - used for drop-down
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/v1/contractor");
        // const data = res.data.filter((con) => con.);
        // console.log(res.data)
        setContractors(res.data || []);
      } catch (err) {
        console.error("load contractors:", err);
      }
    })();
  }, [sites]);

  // when site or contractor or billType changes -> fetch relevant candidate items
  useEffect(() => {
    setCandidates([]);
    setSelectedRef(null);
    setToPay("");

    if (!siteId) return;

    const fetchCandidates = async () => {
      setLoading(true);
      try {
        if (billType === "workorder") {
          if (!contractorId) {
            setCandidates([]);
            return;
          }
          // fetch workorders for site + contractor
          const res = await axios.get(
            `/api/v1/work-order/${siteId}/${contractorId}`,
          );
          // flatten eligible stages (due > 0)
          const orders = Array.isArray(res.data)
            ? res.data
            : res.data.workOrders || res.data;
          const items = [];
          orders.forEach((order) => {
            (order.works || []).forEach((work, wi) => {
              (work.stages || work.stages || []).forEach((stage, si) => {
                // prefer 'due' or stage.amount - stage.paid
                const due = Number(
                  stage.due ?? stage.amount - (stage.paid || 0) ?? 0,
                );
                if (due <= 0) return;
                items.push({
                  type: "workorder",
                  label: stage.name,
                  workOrderId: order._id,
                  workId: work.id ?? work._id ?? wi,
                  stageId: stage.id ?? stage._id ?? si,
                  workName: work.name,
                  stageName: stage.name,
                  qty: work.qty ?? work.area ?? work.amount ?? 0,
                  unit: work.unit ?? "NOS",
                  rate: stage.stageRate ?? stage.rate ?? work.rate ?? 0,
                  amount:
                    stage.amount ?? work.qty * (stage.stageRate ?? work.rate),
                  paid: stage.paid ?? 0,
                  due,
                  raw: { order, work, stage },
                });
              });
            });
          });
          setCandidates(items);
        } else if (billType === "extrawork") {
          const res = await axios.get(
            `/api/v1/extra-work/${siteId}/${contractorId}`,
          );
          const extras = Array.isArray(res.data)
            ? res.data
            : res.data.extraWorks || [];

          const items = [];
          extras.forEach((ex) => {
            (ex.WorkDetail || []).forEach((wd) => {
              const due = Number(wd.due || wd.amount - (wd.paid || 0));
              if (due <= 0) return;

              items.push({
                type: "extrawork",
                label: wd.work, // show only work name
                extraWorkId: ex._id,
                extraDetailId: wd._id,
                workName: wd.work,
                qty: wd.area ?? 0,
                unit: wd.unit ?? "NOS",
                rate: wd.rate ?? 0,
                amount: wd.amount,
                paid: wd.paid ?? 0,
                due,
              });
            });
          });

          setCandidates(items);
        } else if (billType === "supplylabour") {
          const res = await axios.get(`/api/v1/labour-attendance/${siteId}`);
          console.log(res);
          const rows = Array.isArray(res.data) ? res.data : res.data.rows || [];
          const items = [];
          // console.log(rows);
          rows.forEach((r) => {
            // compute totals per row: sum qty * rate for each category
            const skilledMaleRate = Number(
              r.skilledMaleRate || r.skilledMale_rate || 0,
            );
            const skilledFemaleRate = Number(
              r.skilledFemaleRate || r.skilledFemale_rate || 0,
            );
            const unskilledMaleRate = Number(
              r.unskilledMaleRate || r.unskilledMale_rate || 0,
            );
            const unskilledFemaleRate = Number(
              r.unskilledFemaleRate || r.unskilledFemale_rate || 0,
            );
            const sm = Number(r.skilledMale || 0);
            const sf = Number(r.skilledFemale || 0);
            const um = Number(r.unskilledMale || 0);
            const uf = Number(r.unskilledFemale || 0);
            const amount =
              sm * skilledMaleRate +
              sf * skilledFemaleRate +
              um * unskilledMaleRate +
              uf * unskilledFemaleRate;
            const paid = Number(r.paid || 0);
            const due = Math.max(0, amount - paid);
            if (due <= 0) return;
            const date = new Date(r.createdAt).toLocaleDateString("en-IN");
            items.push({
              type: "supplylabour",
              label: ` ${r.work} — ${date}`,
              labourId: r._id,
              row: r,
              work: r.work,
              skilledMale: sm,
              skilledMaleRate,
              skilledFemale: sf,
              skilledFemaleRate,
              unskilledMale: um,
              unskilledMaleRate,
              unskilledFemale: uf,
              unskilledFemaleRate,
              amount,
              paid,
              due,
            });
          });
          setCandidates(items);
        }
      } catch (err) {
        console.error("fetchCandidates:", err);
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [siteId, contractorId, billType]);

  // selectedRef derived from candidates + selectedRefIdentifier
  const handleSelectCandidate = (key) => {
    const item = candidates.find(
      (c, idx) =>
        c.label === key ||
        c.stageId === key ||
        c.extraDetailId === key ||
        c.labourId === key ||
        c.workId === key ||
        idx === Number(key),
    );
    if (!item) {
      // maybe key is index
      const idx = Number(key);
      setSelectedRef(candidates[idx] || null);
      setToPay("");
      return;
    }
    console.log("item", item);
    setSelectedRef(item);
    setToPay("");
  };

  // toPay number validation and ensure <= due
  const handleToPayChange = (val) => {
    if (val === "" || val === null) {
      setToPay("");
      return;
    }
    const n = Number(val);
    if (isNaN(n) || n < 0) return;
    // allow pay upto due (or full amount)
    const max = Number(selectedRef?.due ?? selectedRef?.amount ?? 0);
    if (n > max) {
      setToPay(String(max));
      toast("Amount adjusted to maximum due");
      return;
    }
    setToPay(String(n));
  };

  // Build payload and submit - unified
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!siteId) return toast.error("Please select site");
    if (!selectedRef) return toast.error("Please select item to bill");
    const pay = Number(toPay || 0);
    if (!pay || pay <= 0)
      return toast.error("Enter amount to pay (partial allowed)");

    setLoading(true);
    try {
      const base = {
        billType,
        site: siteId,
        contractor: billType === "supplylabour" ? "Supply Labour" : "",
        contractorId:
          billType === "workorder" || billType === "extrawork"
            ? contractorId
            : null,
        toPay: pay,
        totalAmount: Number(selectedRef.amount || 0),
        prevPaid: Number(selectedRef.paid || 0),
        dueBefore: Number(selectedRef.due || 0),
        meta: {},
      };

      // references
      if (billType === "workorder") {
        base.reference = {
          workOrderId: selectedRef.workOrderId,
          workId: selectedRef.workId,
          stageId: selectedRef.stageId,
        };
        base.meta = {
          workName: selectedRef.workName,
          stageName: selectedRef.stageName,
          qty: selectedRef.qty,
          unit: selectedRef.unit,
          rate: selectedRef.rate,
        };
      } else if (billType === "extrawork") {
        base.reference = {
          extraWorkId: selectedRef.extraWorkId,
          extraDetailId: selectedRef.extraDetailId,
        };
        base.meta = {
          workName: selectedRef.workName,
          qty: selectedRef.qty,
          unit: selectedRef.unit,
          rate: selectedRef.rate,
        };
      } else if (billType === "supplylabour") {
        base.reference = {
          labourAttendanceId: selectedRef.labourId,
        };
        base.meta = {
          work: selectedRef.work,
          skilledMale: selectedRef.skilledMale,
          skilledMaleRate: selectedRef.skilledMaleRate,
          skilledFemale: selectedRef.skilledFemale,
          skilledFemaleRate: selectedRef.skilledFemaleRate,
          unskilledMale: selectedRef.unskilledMale,
          unskilledMaleRate: selectedRef.unskilledMaleRate,
          unskilledFemale: selectedRef.unskilledFemale,
          unskilledFemaleRate: selectedRef.unskilledFemaleRate,
        };
      }

      // submit to backend
      const res = await axios.post("/api/v1/bill", base);
      toast.success(res.data?.message || "Bill created");
      // optionally dispatch notifications reload
      dispatch(fetchNotifications(user._id));
      onClose && onClose();
    } catch (err) {
      console.error("create bill:", err);
      toast.error(err?.response?.data?.message || "Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  // UI helpers for showing selected detail
  const SelectedDetail = () => {
    if (!selectedRef) return null;
    if (selectedRef.type === "workorder") {
      return (
        <div className="border rounded p-3 bg-white">
          <h4 className="font-semibold">{selectedRef.workName}</h4>
          <p className="text-sm text-gray-600">{selectedRef.stageName}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              Qty: {selectedRef.qty} {selectedRef.unit}
            </div>
            <div>Rate: ₹{selectedRef.rate}</div>
            <div>Amount: ₹{selectedRef.amount}</div>
            <div>Due: ₹{selectedRef.due}</div>
            <div>Paid: ₹{selectedRef.paid}</div>
          </div>
        </div>
      );
    }
    if (selectedRef.type === "extrawork") {
      return (
        <div className="border rounded p-3 bg-white">
          <h4 className="font-semibold">{selectedRef.workName}</h4>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              Qty: {selectedRef.qty} {selectedRef.unit}
            </div>
            <div>Rate: ₹{selectedRef.rate}</div>
            <div>Amount: ₹{selectedRef.amount}</div>
            <div>Due: ₹{selectedRef.due}</div>
            <div>Paid: ₹{selectedRef.paid}</div>
          </div>
        </div>
      );
    }
    if (selectedRef.type === "supplylabour") {
      return (
        <div className="border rounded p-3 bg-white">
          <h4 className="font-semibold">
            Supply Labour -{" "}
            {new Date(selectedRef.row.date).toLocaleDateString()}
          </h4>
          <p className="font-semibold">Work - {selectedRef.work}</p>
          <div className="grid grid-cols-1 gap-2 mt-2 text-sm">
            <div>
              Skilled Male: {selectedRef.skilledMale} × ₹
              {selectedRef.skilledMaleRate} = ₹
              {selectedRef.skilledMale * selectedRef.skilledMaleRate}
            </div>
            <div>
              Skilled Female: {selectedRef.skilledFemale} × ₹
              {selectedRef.skilledFemaleRate} = ₹
              {selectedRef.skilledFemale * selectedRef.skilledFemaleRate}
            </div>
            <div>
              Unskilled Male: {selectedRef.unskilledMale} × ₹
              {selectedRef.unskilledMaleRate} = ₹
              {selectedRef.unskilledMale * selectedRef.unskilledMaleRate}
            </div>
            <div>
              Unskilled Female: {selectedRef.unskilledFemale} × ₹
              {selectedRef.unskilledFemaleRate} = ₹
              {selectedRef.unskilledFemale * selectedRef.unskilledFemaleRate}
            </div>
            <div className="font-medium">Total: ₹{selectedRef.amount}</div>
            <div>Paid: ₹{selectedRef.paid}</div>
            <div className="text-red-600">Due: ₹{selectedRef.due}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-lg mx-auto  rounded">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bill Type
          </label>
          <select
            value={billType}
            onChange={(e) => {
              setBillType(e.target.value);
              setCandidates([]);
              setSelectedRef(null);
            }}
            className="w-full border p-2 rounded"
          >
            {BILL_TYPES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Site
          </label>
          <select
            value={siteId}
            onChange={(e) => {
              setSiteId(e.target.value);
              setCandidates([]);
              setSelectedRef(null);
            }}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Site</option>
            {sites.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {(billType === "workorder" || billType === "extrawork") && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contractor
            </label>
            <select
              value={contractorId}
              onChange={(e) => {
                setContractorId(e.target.value);
                setCandidates([]);
                setSelectedRef(null);
              }}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Contractor</option>
              {contractors.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {billType === "supplylabour" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contractor
            </label>
            <select
              value={"Supply Labour"}
              disabled
              className="w-full border p-2 rounded bg-gray-100"
            >
              <option value="Supply Labour">Supply Labour</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Work / Stage
          </label>
          <select
            value={selectedRef?.label ?? ""}
            onChange={(e) => handleSelectCandidate(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">
              {loading ? "Loading..." : "Select an item"}
            </option>
            {candidates.map((c, idx) => (
              <option key={idx} value={c.label || idx}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {selectedRef && (
          <>
            <SelectedDetail />
            <div>
              <label className="block text-sm font-medium text-gray-700 mt-2">
                Amount to pay (partial payment allowed)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={toPay}
                onChange={(e) => handleToPayChange(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder={`Max ₹${selectedRef.due}`}
              />
              <div className="text-xs text-gray-500 mt-1">
                Due: ₹{selectedRef.due} • Prev Paid: ₹{selectedRef.paid}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !selectedRef || !siteId}
            className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-70"
          >
            {loading ? "Processing..." : "Create Bill"}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose && onClose();
            }}
            className="flex-1 border px-3 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>

    </div>
  );
};

export default CreateBill;
