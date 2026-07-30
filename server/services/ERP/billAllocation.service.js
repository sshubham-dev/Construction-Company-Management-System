const BillAllocation = require("../../models/BillAllocation.models");
const Purchase = require("../../models/purchase.models");
// const Sales = require("../../../models/Sales");
const Bill = require("../../models/bill.models");
const ExtraWork = require("../../models/extrawork.models");

const billModels = {
    PURCHASE: Purchase,
    // SALES: Sales,
    CONTRACTOR_BILL: Bill,
    EXTRA_WORK: ExtraWork,
};

const createBillAllocation = async (
    {
        companyId,
        partyLedgerId,
        billType,
        billId,
        allocationType,
        allocationId,
        amount,
        allocatedDate = new Date(),
        createdBy,
        remarks = "",
    },
    session = null
) => {
    if (!companyId) {
        throw new Error("Company is required.");
    }

    if (!partyLedgerId) {
        throw new Error("Party ledger is required.");
    }

    if (!billType) {
        throw new Error("Bill type is required.");
    }

    if (!billId) {
        throw new Error("Bill id is required.");
    }

    if (!allocationType) {
        throw new Error("Allocation type is required.");
    }

    if (!allocationId) {
        throw new Error("Allocation id is required.");
    }

    if (!amount || amount <= 0) {
        throw new Error("Allocation amount must be greater than zero.");
    }

    // Prevent duplicate allocation
    const exists = await BillAllocation.findOne({
        billType,
        billId,
        allocationType,
        allocationId,
    }).session(session);

    if (exists) {
        throw new Error("Bill allocation already exists.");
    }

    const allocation = new BillAllocation({
        companyId,
        partyLedgerId,
        billType,
        billId,
        allocationType,
        allocationId,
        amount,
        allocatedDate,
        createdBy,
        remarks,
    });

    await allocation.save({ session });

    return allocation;
};



const deleteBillAllocation = async (
    {
        allocationType,
        allocationId,
        billType,
        billId,
    },
    session = null
) => {
    const filter = {};

    if (allocationType) filter.allocationType = allocationType;
    if (allocationId) filter.allocationId = allocationId;
    if (billType) filter.billType = billType;
    if (billId) filter.billId = billId;

    if (Object.keys(filter).length === 0) {
        throw new Error("No delete criteria provided.");
    }

    return await BillAllocation.deleteMany(filter, { session });
};



const getBillOutstanding = async ({
    billType,
    billId,
}) => {
    const Model = billModels[billType];

    if (!Model) {
        throw new Error("Invalid bill type.");
    }

    const bill = await Model.findById(billId);

    if (!bill) {
        throw new Error("Bill not found.");
    }

    const result = await BillAllocation.aggregate([
        {
            $match: {
                billType,
                billId: bill._id,
            },
        },
        {
            $group: {
                _id: null,
                allocatedAmount: {
                    $sum: "$amount",
                },
            },
        },
    ]);

    const allocatedAmount = result[0]?.allocatedAmount || 0;

    return {
        totalAmount: bill.grandTotal,
        allocatedAmount,
        outstandingAmount: bill.grandTotal - allocatedAmount,
    };
};


const getPartyOutstanding = async ({
    companyId,
    partyLedgerId,
}) => {
    const allocations = await BillAllocation.aggregate([
        {
            $match: {
                companyId,
                partyLedgerId,
            },
        },
        {
            $group: {
                _id: {
                    billType: "$billType",
                    billId: "$billId",
                },
                allocatedAmount: {
                    $sum: "$amount",
                },
            },
        },
    ]);

    return allocations;
};


module.exports = { createBillAllocation, deleteBillAllocation, getBillOutstanding, getPartyOutstanding };