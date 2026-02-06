import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineRemoveCircle, MdOutlineAddCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  createEmployee,
  fetchEmployeeById,
  fetchEmployees,
  updateEmployee,
} from "../features/hr/employeeSlice";
import { fetchNotifications } from "../features/notification/notificationSlice";
import Select from "react-select";
axios.defaults.withCredentials = true;

const CreateEmployee = ({ onClose, isEdit }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    birthdate: "",
    address: "",
    department: "",
    reportingManagerId: "",
    businessUnitId: "",
    baseSalary: "",
    status: "Active",
    isUser: false,
    addhar: "",
    panNo: "",
    uan: "",
    cv: "",
    offerletter: "",
    certificates: [],
    bank: "",
    incentiveConfig: {
      trafficLight: {
        greenBonus: 2000,
        redPenalty: 1000,
      },
      targets: [],
    },
  });
  const departments = [
    "Accountant",
    "Marketing",
    "Ceo",
    "Site Incharge",
    "Site Supervisor",
    "Design Engineer",
    "Quality Engineer",
    "Store Incharge",
    "H.R",
    "Account Head",
    "Store Helper",
  ];
  const [reportingManager, setReportingManager] = useState([]);
  const [businessUnit, setBusinessUnit] = useState([]);
  // const employees = useSelector((state) => state.employee.all);
  useEffect(() => {
    const fetchManager = async () => {
      const res = await dispatch(fetchEmployees());
      setReportingManager(res.payload || []);
    };
    fetchManager();
  }, [dispatch]);

  useEffect(() => {
    if (isEdit) {
      fetchEmployee(isEdit);
    }
  }, [isEdit]);
  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    const res = await axios.get("/api/v1/business-unit");
    console.log(res.data);
    setBusinessUnit(res.data);
  };
  const fetchEmployee = async (id) => {
    console.log(isEdit);
    const res = await dispatch(fetchEmployeeById({ id }));
    const emp = res.payload;
    console.log(emp);
    setEmployee({
      name: emp?.name,
      email: emp?.email,
      phone: emp?.phone,
      whatsapp: emp?.whatsapp,
      birthdate: emp?.birthdate,
      address: emp?.address,
      department: emp?.department,
      reportingManagerId: emp?.reportingManagerId,
      businessUnitId: emp?.businessUnitId,
      baseSalary: emp?.baseSalary,
      status: emp?.status,
      isUser: emp?.isUser,
      addhar: emp?.addhar,
      panNo: emp?.panNo,
      uan: emp?.uan,
      cv: "",
      offerletter: "",
      certificates: [],
      bank: "",
      incentiveConfig: {
        trafficLight: {
          greenBonus: emp?.incentiveConfig.trafficLight.greenBonus,
          redPenalty: emp?.incentiveConfig.trafficLight.redPenalty,
        },
        targets: emp?.incentiveConfig.targets,
      },
    });
  };
  /* ================= HANDLERS ================= */
  const inputData = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = value;
    if (value === "") finalValue = null;

    setEmployee((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : finalValue,
    }));
  };

  const handleTrafficChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      incentiveConfig: {
        ...prev.incentiveConfig,
        trafficLight: {
          ...prev.incentiveConfig.trafficLight,
          [name]: Number(value),
        },
      },
    }));
  };

  const addTargetRule = () => {
    setEmployee((prev) => ({
      ...prev,
      incentiveConfig: {
        ...prev.incentiveConfig,
        targets: [
          ...prev.incentiveConfig.targets,
          {
            targetType: "",
            baseTargetValue: 0,
            bonusType: "FIXED",
            bonusValue: 0,
          },
        ],
      },
    }));
  };

  const updateTargetRule = (index, field, value) => {
    const updated = [...employee.incentiveConfig.targets];
    updated[index][field] = value;
    setEmployee((prev) => ({
      ...prev,
      incentiveConfig: {
        ...prev.incentiveConfig,
        targets: updated,
      },
    }));
  };

  const removeTargetRule = (index) => {
    setEmployee((prev) => ({
      ...prev,
      incentiveConfig: {
        ...prev.incentiveConfig,
        targets: prev.incentiveConfig.targets.filter((_, i) => i !== index),
      },
    }));
  };

  /* ================= DRAFT ================= */
  const saveDraft = () => {
    const key = `employee@${employee?.name} - ${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(employee));
    toast.success("Draft saved");
  };

  const getDrafts = () =>
    Object.keys(localStorage).filter((k) => k.startsWith("employee@"));

  const removeDraft = (key) => {
    if (key) {
      const keyValue = Object.keys(localStorage).filter((k) =>
        k.includes(`employee@${key}`),
      );
      localStorage.removeItem(keyValue);
      toast.success("Removed Draft");
    } else {
      const res = confirm("Want to remove all!");
      console.log(res);
      if (res === true) {
        const keyValue = Object.keys(localStorage).filter((k) =>
          k.includes(`employee@`),
        );
        console.log(keyValue);
        for (let i = 1; i <= keyValue.length; i++) {
          localStorage.removeItem(keyValue);
          toast.success("Drafts Removed");
          console.log(`${i} Drafts Removed`);
        }
      }
    }
  };

  const loadDraft = (key) => {
    if (!key) return;
    setEmployee(JSON.parse(localStorage.getItem(key)));
    toast.success("Draft loaded");
  };

  /* ================= SUBMIT ================= */
  const submitForm = async () => {
    setLoading(true);
    try {
      const cleanEmployee = {
        ...employee,
        reportingManagerId: employee.reportingManagerId || undefined,
        businessUnitId: employee.businessUnitId || undefined,
        incentiveConfig: {
          ...employee.incentiveConfig,
          targets: employee.incentiveConfig.targets,
        },
      };
      const action = isEdit
        ? updateEmployee({ id: isEdit, data: cleanEmployee })
        : createEmployee({ data: cleanEmployee });

      await dispatch(action);
      dispatch(fetchNotifications(user._id));
      toast.success("Employee saved successfully");
      onClose();
    } catch {
      toast.error("Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  /* ================= COMMON CLASSES ================= */
  const inputClass =
    "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";
  const labelClass = "text-sm font-medium text-gray-700";
  const sectionTitle = "text-lg font-semibold text-gray-800 mb-4";

  /* ================= STEP NAV ================= */
  const StepNavigation = () => (
    <div className="flex items-center justify-between mb-6">
      <button
        disabled={step === 1}
        onClick={() => setStep(step - 1)}
        className="px-3 py-1 text-sm rounded bg-gray-200 disabled:opacity-50"
      >
        Back
      </button>
      <span className="text-sm font-medium">Step {step} of 4</span>
      <button
        disabled={step === 4}
        onClick={() => setStep(step + 1)}
        className="px-3 py-1 text-sm rounded bg-blue-500 text-white disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <StepNavigation />

      {/* STEP 1 — BASIC DETAILS */}
      {step === 1 && (
        <>
          <h2 className={sectionTitle}>Basic Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Full Name</label>
              <input
                className={inputClass}
                name="name"
                value={employee.name}
                onChange={inputData}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Email</label>
              <input
                className={inputClass}
                name="email"
                value={employee.email}
                onChange={inputData}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                name="phone"
                value={employee.phone}
                onChange={inputData}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input
                className={inputClass}
                name="whatsapp"
                value={employee.whatsapp}
                onChange={inputData}
              />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                className={inputClass}
                name="birthdate"
                value={employee.birthdate}
                onChange={inputData}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Address</label>
            <input
              className={inputClass}
              name="address"
              value={employee.address}
              onChange={inputData}
            />
          </div>
        </>
      )}

      {/* STEP 2 — COMPANY */}
      {step === 2 && (
        <>
          <h2 className={sectionTitle}>Company & Payroll</h2>
          <div className="grid grid-cols-2 gap-4">
            <select
              className={inputClass}
              name="department"
              value={employee.department || ""}
              onChange={inputData}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* <Select
            options={businessUnit.map((b) => ({ value: b._id, label: b.name }))}
            value={businessUnit.find(b => b._id === employee.businessUnitId) || null}
            onChange={(selected) =>
              setEmployee((prev) => ({
                ...prev, businessUnitId: selected ? selected.value : "",
              }))
            }
            // onChange={inputData}
            /> */}
            <select
              className={inputClass}
              name="businessUnitId"
              value={employee.businessUnitId || ""}
              onChange={inputData}
            >
              <option value="">Select Business Unit</option>
              {businessUnit.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              className={inputClass}
              name="reportingManagerId"
              value={employee.reportingManagerId || ""}
              onChange={inputData}
            >
              <option value="">Select Reporting Manager</option>
              {reportingManager.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              name="baseSalary"
              placeholder="Base Salary"
              value={employee.baseSalary}
              onChange={inputData}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <select
              className={inputClass}
              name="status"
              value={employee.status}
              onChange={inputData}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Resigned">Resigned</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isUser"
                checked={employee.isUser}
                onChange={inputData}
              />
              Is User
            </label>
          </div>
        </>
      )}

      {/* STEP 3 — DOCUMENTS */}
      {step === 3 && (
        <>
          <h2 className={sectionTitle}>Documents</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputClass}
              placeholder="Addhar No"
              value={employee.addhar}
              onChange={(e) =>
                setEmployee((p) => ({ ...p, addhar: e.target.value }))
              }
            />
            <input
              className={inputClass}
              placeholder="Pan No"
              value={employee.panNo}
              onChange={(e) =>
                setEmployee((p) => ({ ...p, panNo: e.target.value }))
              }
            />
            <input
              className={inputClass}
              placeholder="UAN No"
              value={employee.uan}
              onChange={(e) =>
                setEmployee((p) => ({ ...p, uan: e.target.value }))
              }
            />
            {/* <input className={inputClass} placeholder="CV URL" value={employee.cv} onChange={(e) => setEmployee(p => ({ ...p, cv: e.target.value }))} />
            <input className={inputClass} placeholder="Offer Letter URL" value={employee.offerletter} onChange={(e) => setEmployee(p => ({ ...p, offerletter: e.target.value }))} /> */}
          </div>
        </>
      )}

      {/* STEP 4 — INCENTIVES */}
      {step === 4 && (
        <>
          <h2 className={sectionTitle}>Traffic Light & Incentives</h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputClass}
              type="number"
              name="greenBonus"
              value={employee.incentiveConfig.trafficLight.greenBonus}
              onChange={handleTrafficChange}
              placeholder="Green Bonus"
            />
            <input
              className={inputClass}
              type="number"
              name="redPenalty"
              value={employee.incentiveConfig.trafficLight.redPenalty}
              onChange={handleTrafficChange}
              placeholder="Red Penalty"
            />
          </div>

          <div className="mt-4">
            {employee.incentiveConfig.targets?.map((t, i) => (
              <div key={i} className="border px-3 py-4 rounded mb-2">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <select
                    className={inputClass}
                    value={t.targetType}
                    onChange={(e) =>
                      updateTargetRule(i, "targetType", e.target.value)
                    }
                  >
                    <option value="">Target Type</option>
                    <option value="SITE_WORK">Site Work</option>
                    <option value="REVENUE">Revenue</option>
                  </select>

                  <input
                    className={inputClass}
                    type="number"
                    placeholder="Base Target"
                    value={t.baseTargetValue}
                    onChange={(e) =>
                      updateTargetRule(i, "baseTargetValue", e.target.value)
                    }
                  />

                  <select
                    className={inputClass}
                    value={t.bonusType}
                    onChange={(e) =>
                      updateTargetRule(i, "bonusType", e.target.value)
                    }
                  >
                    <option value="FIXED">Fixed</option>
                    <option value="PERCENTAGE">Percentage</option>
                  </select>
                  <input
                    className={inputClass}
                    placeholder="Bonus"
                    type="number"
                    value={t.bonusValue}
                    onChange={(e) =>
                      updateTargetRule(i, "bonusValue", e.target.value)
                    }
                  />
                </div>
                <button
                  onClick={() => removeTargetRule(i)}
                  className="text-red-500 text-sm mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="mt-2 px-3 py-1 text-sm bg-gray-200 rounded"
              onClick={addTargetRule}
            >
              + Add Target Rule
            </button>
          </div>
        </>
      )}

      {/* ACTIONS */}
      <div className="grid grid-cols-1 gap-3 mt-6">
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-4">
            <button
              className="px-3 py-2 bg-green-600 rounded text-sm text-white"
              onClick={saveDraft}
            >
              Save Draft
            </button>
            <button
              className="px-3 py-2 bg-red-600 rounded text-sm text-white"
              onClick={(e) => removeDraft(employee?.name)}
            >
              Remove Draft
            </button>
          </div>
          <select
            className="px-2 py-2 border rounded text-sm"
            onChange={(e) => loadDraft(e.target.value)}
          >
            <option value="">Load Draft</option>
            {getDrafts().map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {step === 4 && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            onClick={submitForm}
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        )}
      </div>

      <Toaster />
    </div>
  );
};

export default CreateEmployee;
