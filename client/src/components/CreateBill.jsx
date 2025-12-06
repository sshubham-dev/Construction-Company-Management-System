import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";
import { useNavigate, useParams } from "react-router-dom";

axios.defaults.withCredentials = true;

// const CreateBill = ({ onClose, isEdit }) => {
//   const [sites, setSite] = useState([]);
//   const [data, setData] = useState({
//     site: "",
//     contractor: "",
//   });
//   const [bill, setBill] = useState({
//     site: "",
//     contractor: "",
//     billOf: {},
//     toPay: "",
//     unit: "",
//   });
//   const [contractors, setContractor] = useState([]);
//   const { user } = useSelector((state) => state.auth);
//   const [billToEdit, setBillToEdit] = useState(null);
//   const [billWork, setBillWork] = useState([]);
//   const [paymentDetail, setPaymentDetail] = useState({});
//   const units = ["%", "₹"];
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchSite = async () => {
//       try {
//         const response = await axios.get("/api/v1/site");
//         console.log(user);
//         if (
//           user?.department === "Site Incharge" ||
//           user?.department === "Site Supervisor"
//         ) {
//           const existingSites = user?.site;
//           let SitesData = [];
//           for (let site of response.data) {
//             if (
//               existingSites?.some(
//                 (existingSite) => existingSite.id === site._id
//               )
//             ) {
//               SitesData.push(site);
//             }
//           }
//           setSite(SitesData);
//           // console.log(SitesData)
//         } else {
//           setSite(response.data);
//         }
//       } catch (error) {
//         console.error(error.message);
//       }
//     };
//     fetchSite();
//     if (isEdit) {
//       setBillToEdit(isEdit);
//       fetchBill(isEdit);
//     }
//   }, []);

//   useEffect(() => {
//     const siteId = bill.site;
//     let siteData = [];
//     if (siteId) {
//       siteData = sites.filter((site) => site._id === siteId);
//     }
//     // console.log(bill.site);
//     // console.log(siteData);
//     setContractor(siteData[0]?.contractor || "");
//     // console.log(siteData[0]?.contractor);
//   }, [bill.site]);

//   useEffect(() => {
//     if (!bill.site || !bill.contractor) return;

//     const getWorkOrder = async () => {
//       try {
//         const response = await axios.get(
//           `/api/v1/work-order/${bill.site}/${bill.contractor}`
//         );

//         const orders = response.data;
//         console.log(response.data);
//         // Extract workStages correctly
//         const allWorkStages = [];

//         orders.forEach((order) => {
//           order.works?.forEach((work, wi) => {
//             if (work.due === 0) return;

//             work.stages?.forEach((stage, si) => {
//               if (stage.due === 0) return;

//               allWorkStages.push({
//                 workId: work.id,
//                 workIndex: wi,
//                 stageId: stage.id,
//                 stageIndex: si,
//                 workName: work.name,
//                 stageName: stage.name,
//                 qty: work.qty,
//                 unit: work.unit,
//                 rate: work.rate,
//                 stageRate: stage.stageRate,
//                 amount: stage.amount,
//                 paid: stage.paid,
//                 due: stage.due,
//               });
//             });
//           });
//         });

//         console.log(allWorkStages);
//         setBillWork(allWorkStages);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     getWorkOrder();
//   }, [bill.contractor, bill.site]);

//   useEffect(() => {
//     const selected = billWork.find((w) => w.stageName === bill.billOf);
//     setPaymentDetail(selected || {});

//   }, [bill.billOf, billWork]);
//   // console.log(paymentDetail)

//   const fetchBill = async (id) => {
//     try {
//       const billData = await axios.get(`/api/v1/bill/${id}`);
//       // console.log(billData.data)
//       setData({
//         site: billData.data.site?.name,
//         contractor: billData.data.contractor?.name,
//       });

//       setBill({
//         site: billData.data?.site._id,
//         contractor: billData.data.contractor?._id,
//         billOf: billData.data?.billOf,
//         toPay: billData.data.toPay,
//         // billNo: billData.data.billNo,
//         amount: billData.data?.amount,
//         createdBy: billData.data?.createdBy?._id,
//         dateOfPayment: billData.data?.dateOfPayment,
//         paymentStatus: billData.data?.paymentStatus,
//         reason: billData.data?.reason,
//         paidAmount: billData.data?.paidAmount,
//         dueAmount: billData.data?.dueAmount,
//       });
//       // console.log(billData.data?.billOf)
//     } catch (error) {
//       console.error(error);
//       toast.error(error.message);
//     }
//   };

//   const handleChange = (field, data) => {
//     setBill({
//       ...bill,
//       [field]: data,
//     });
//     // const selected = billWork.find((w) => w.stageId === e.target.value);
//     // setPaymentDetail(selected || {});

//     // setBill({
//     //   ...bill,
//     //   billOf: selected.workName + " - " + selected.stageName,
//     //   workId: selected.workId,
//     //   workIndex: selected.workIndex,
//     //   stageId: selected.stageId,
//     //   stageIndex: selected.stageIndex
//     // });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (billToEdit) {
//         // console.log(bill)
//         // const paid = parseFloat(bill.paidAmount);
//         // const updateBill = await axios.put(`/api/v1/bill/${billToEdit}`, bill);
//         // if (updateBill) {
//         //   console.log(updateBill.data);
//         //   toast.success(updateBill.data.message);
//         //   dispatch(fetchNotifications(user._id));
//         //   onClose();
//         // }
//         console.log(bill)
//       } else {
//         console.log(bill);
//         // const response = await axios.post("/api/v1/bill", bill);
//         // console.log(response.data?.ContractorBill);
//         // toast.success(response.data.message);
//         // dispatch(fetchNotifications(user._id));
//         // onClose();
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   return (
//     <div>
//       <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label
//             htmlFor="site"
//             className="block text-sm font-medium text-gray-600 mb-2"
//           >
//             Site
//           </label>
//           <select
//             name="site"
//             value={bill.site}
//             required
//             onChange={(e) => handleChange("site", e.target.value)}
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//           >
//             <option>{billToEdit ? data.site : "Site"}</option>
//             {sites?.map((site) => (
//               <option key={site._id} value={site._id}>
//                 {site.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="mb-4">
//           <label
//             htmlFor="contractor"
//             className="block text-sm font-medium text-gray-600 mb-2"
//           >
//             Choose Contractor
//           </label>
//           <select
//             name="contractor"
//             value={bill.contractor}
//             onChange={(e) => handleChange("contractor", e.target.value)}
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//           >
//             <option>{billToEdit ? data.contractor : "Contractor"}</option>
//             {contractors &&
//               contractors?.map((contractor) => (
//                 <option key={contractor?._id} value={contractor?.id}>
//                   {contractor?.name}
//                 </option>
//               ))}
//           </select>
//         </div>

//         <div className="mb-4">
//           <label
//             htmlFor="work"
//             className="block text-sm font-medium text-gray-600 mb-2"
//           >
//             Work
//           </label>
//           <select
//             value={bill.billOf}
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             onChange={(e) => handleChange("billOf", e.target.value)}
//           >
//             <option>{billToEdit ? bill?.billOf : "Work"}</option>
//             {billWork?.map((work, index) => (
//               <option key={index} value={work.name}>
//                 {work.stageName}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="mb-4">
//           <label
//             htmlFor="toPay"
//             className="block text-sm font-medium text-gray-600 mb-2"
//           >
//             To Pay
//           </label>
//           <input
//             type="text"
//             name="toPay"
//             id="toPay"
//             value={bill.toPay}
//             onChange={(e) => handleChange("toPay", e.target.value)}
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//           />
//         </div>

//         <div className="mb-4">
//           <h2 className="block text-lg font-semibold text-gray-600 mb-2 mt-4">
//             Work Detail
//           </h2>
//           <p className="text-sm font-medium text-gray-600 my-1">
//             Description: {paymentDetail?.workName}
//           </p>
//           <hr />
//           <p className="text-md font-medium text-gray-600 my-1">
//             Rate: ₹ {paymentDetail?.rate}
//             {" " + "/" + " " + paymentDetail?.unit}
//           </p>
//           <hr />
//           <p className="text-md font-medium text-gray-600 my-1">
//             Quantity: {paymentDetail?.qty} {paymentDetail?.unit}
//           </p>
//           <hr />
//           <p className="text-md font-medium text-gray-600 my-1">
//             Amount: ₹ {paymentDetail?.rate*paymentDetail?.qty}
//           </p>
//           <hr />
//         </div>

//         <div className="mb-4">
//           <h2 className="block text-lg font-semibold text-gray-600 mb-2 mt-4">
//             Payment Detail
//           </h2>
//           <p className="text-md font-medium text-gray-600 my-1">
//             Work: {paymentDetail?.stageName}
//           </p>
//           <hr />
//           <p className="text-md font-medium text-gray-600 my-1">
//             Rate: ₹ {paymentDetail?.stageRate}
//             {" " + "/" + " " + paymentDetail?.unit}
//           </p>
//           <hr />
//           <p className="text-md font-medium text-gray-600 my-1">
//             Quantity: {paymentDetail?.qty} {paymentDetail?.unit}
//           </p>
//           <hr />
//           <p className="text-md font-medium text-gray-600 my-1">
//             Total Amount: ₹ {paymentDetail?.amount}
//           </p>
//           <hr />
//           <p className="text-md font-medium text-gray-600 my-1">
//             Total Paid: ₹ {paymentDetail?.paid}
//           </p>
//           <hr />
//           <p className="text-md font-medium text-gray-600 my-1">
//             Total Due: ₹ {paymentDetail?.due}
//           </p>
//         </div>

//         <div className="text-center">
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
//             disabled={loading}
//           >
//             {loading
//               ? "Submitting..."
//               : `${billToEdit ? "Update Bill" : "Create Bill"}`}
//           </button>
//         </div>
//       </form>
//       <Toaster position="top-right" reverseOrder={false} />
//     </div>
//   );
// };

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
    (async () => {
      try {
        const res = await axios.get("/api/v1/site");
        setSites(res.data || []);
      } catch (err) {
        console.error("load sites:", err);
      }
    })();
  }, []);

  // load contractors (global) - used for drop-down
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/v1/contractor");
        setContractors(res.data || []);
      } catch (err) {
        console.error("load contractors:", err);
      }
    })();
  }, []);

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
            `/api/v1/work-order/${siteId}/${contractorId}`
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
                  stage.due ?? stage.amount - (stage.paid || 0) ?? 0
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
            `/api/v1/extra-work?site=${siteId}&contractor=${contractorId}`
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
          // supply labour - contractorId expected to be "Supply Labour" or blank; but server filter by contractor param
          const params = new URLSearchParams();
          params.append("site", siteId);
          // we will request supply labour entries
          params.append("contractor", "Supply Labour");
          const res = await axios.get(
            `/api/v1/labour-attendance?${params.toString()}`
          );
          const rows = Array.isArray(res.data) ? res.data : res.data.rows || [];
          const items = [];
          console.log(rows);
          rows.forEach((r) => {
            // compute totals per row: sum qty * rate for each category
            const skilledMaleRate = Number(
              r.skilledMaleRate || r.skilledMale_rate || 0
            );
            const skilledFemaleRate = Number(
              r.skilledFemaleRate || r.skilledFemale_rate || 0
            );
            const unskilledMaleRate = Number(
              r.unskilledMaleRate || r.unskilledMale_rate || 0
            );
            const unskilledFemaleRate = Number(
              r.unskilledFemaleRate || r.unskilledFemale_rate || 0
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
        idx === Number(key)
    );
    if (!item) {
      // maybe key is index
      const idx = Number(key);
      setSelectedRef(candidates[idx] || null);
      setToPay("");
      return;
    }
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
        contractor:
          billType === "workorder" || billType === "extrawork"
            ? contractorId
            : null,
        amount: pay,
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
      try {
        dispatch?.(fetchNotifications?.(user?._id));
      } catch {}
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

      <Toaster position="top-right" />
    </div>
  );
};

export default CreateBill;
