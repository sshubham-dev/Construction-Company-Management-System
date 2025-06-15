import React, { useEffect, useState } from "react";
import axios from 'axios';
import Select from "react-select";
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployees } from "../features/hr/employeeSlice";
import { fetchLedgers, mapLedger } from "../features/erp/ledgerSlice";
import { fetchContractors } from "../features/site/contractorSlice";
import { fetchClients } from "../features/crm/clientSlice";
import { fetchSites } from "../features/site/siteSlice";
import { fetchSuppliers } from "../features/erp/supplierSlice";

const LedgerMaping = ({ onClose }) => {
    const [form, setForm] = useState({
        refrenceType: "",
        refrenceId: "",
        ledger: "",
    });
    const [loading, setLoading] = useState(false);
    const [refrences, setRefrence] = useState([]);
    const dispatch = useDispatch();
    const employees = useSelector((state) => state.employee.all);
    const sites = useSelector((state) => state.site.all);
    const clients = useSelector((state) => state.client.all);
    const contractors = useSelector((state) => state.contractor.all);
    const suppliers = useSelector((state) => state.supplier.all);
    const ledgers = useSelector((state) => state.ledger.all);

    useEffect(() => {
        dispatch(fetchEmployees());
        dispatch(fetchLedgers());
        dispatch(fetchContractors());
        dispatch(fetchClients());
        dispatch(fetchSites());
        dispatch(fetchSuppliers());
    }, [dispatch]);

    useEffect(() => {
        switch (form.refrenceType) {
            case "Employee":
                setRefrence(employees);
                break;
            case "Site":
                setRefrence(sites);
                break;
            case "Client":
                setRefrence(clients);
                break;
            case "Contractor":
                setRefrence(contractors);
                break;
            case "Supplier":
                setRefrence(suppliers);
                break;
            default:
                setRefrence([]);
        }
    }, [form.refrenceType]);


    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value ? value : "" });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log(form)
        try {
            dispatch(mapLedger({id:form.ledger, data:form}))
                setForm({
                type: "",
                id: "",
                ledger: "",
            });
            onClose()
        } catch (error) {
            console.log(error)
        }

    };

    return (
        <div >
            <form onSubmit={handleSubmit} className="space-y-3 mb-5">

                <Select
                    name="ledger"
                    options={ledgers.map(ledger => ({ value: ledger._id, label: ledger.name }))}
                    // value={ledgers.find(ledger => ledger._id === form.from) || null}
                    onChange={(e) => handleChange("ledger", e.value)}
                    placeholder="Ledger"
                />
                <select
                    name="refrenceType"
                    value={form.refrenceType}
                    onChange={(e) => handleChange("refrenceType", e.target.value)}
                    className="border p-2 w-full"
                >
                    <option value="">Select Refrence Type</option>
                    <option value="Employee">Employee</option>
                    <option value="Site">Site</option>
                    <option value="Client">Client</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Supplier">Supplier</option>
                </select>

                <Select
                    name="refrenceId"
                    options={refrences?.map(refrence => ({ value: refrence._id, label: refrence.name }))}
                    onChange={(e) => handleChange("refrenceId", e.value)}
                    placeholder="Refrence"
                />

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white p-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className=" bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {loading ? "Saving..." : "Submit"}
                    </button>
                </div>
            </form>
        </div >
    )
}

export default LedgerMaping