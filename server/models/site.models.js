const mongoose = require('mongoose');
// const { Ledger } = require('./ledger.models');
const { syncLedger } = require('../utils/ledgerSync');

const siteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  client: {
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  siteId: {
    type: String,
    unique: true,
  },
  projectType: {
    type: String,
    default: 'Residential',
    index: true,
  },
  floors: [{
    name: String,
    area: Number,
    unit: String,
  }],
  area: Number,
  address: {
    type: String,
    // street: String,
    // city: String,
    // district: String,
    // state: String,
  },
  incharge: {
    name: String,
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  qualityEngineer: {
    name: String,
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  supervisor: {
    name: String,
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  // Existing fields (linked modules)
  approval: [{
    for: String,
    by: String,
    status: { type: String, default: "Pending" },
  }],
  // Ledger mapping
  ledger: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger' },
  agreement: { type: mongoose.Schema.Types.ObjectId, ref: 'Agreement' },
  checklist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Checklist' }],
  bill: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bill' }],
  workOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Work_Order' }],
  purchaseOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Purchase_Order' }],
  purchaseRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Purchase_Request' }],
  paymentSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment_Schedule' },
  qualitySchedule: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quality_Schedule' }],
  projectSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Project_Schedule' },
  extraWork: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Extra_Work' }],
  contractor: [{ name: String, id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor' }, }],

  // Track income per source
  incomeBreakdown: [{
    source: { type: String },
    amount: Number,
    date: Date,
    receiptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' },
    remarks: String,
  }],
  // Track detailed material expenses
  materialExpenses: [{
    category: { type: String },
    item: String,
    quantity: Number,
    unit: String,
    rate: Number,
    amount: Number,
    supplier: {
      name: String,
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    },
    date: Date,
    remarks: String,
  }],
  // Track detailed labour payments
  labourPayments: [{
    category: { type: String },
    labourName: String,
    amount: Number,
    date: Date,
    remarks: String,
  }],
  // Track profit distribution after each income update
  profitDistribution: {
    totalProfit: Number,
    forMarketing: Number,
    forTax: Number,
    forOffice: Number,
    forSalary: Number,
    forInvestment: Number,
    others: Number,
  },
  // Summary of accounting metrics
  accountSummary: {
    totalIncome: Number,
    totalExpenses: Number,
    materialCost: Number,
    labourCost: Number,
    salary: Number,
    office: Number,
    tax: Number,
    investment: Number,
    marketing: Number,
    balance: Number,
    profit: Number,
  },
  // High-level stats (for dashboard/reporting)
  totalReceived: Number,
  totalPaid: Number,
  totalExpenses: Number,
  balance: Number,

}, { timestamps: true });


siteSchema.pre('save', async function (next) {
  if (this.siteId) return next(); // Already set manually
  try {
    const cleaned = this.name.trim().split(" ")[0].replace(/[^a-zA-Z0-9]/g, '');
    const prefix = cleaned.substring(0, 3).toUpperCase();

    const regex = new RegExp(`^${prefix}-\\d{3}$`, 'i');
    const existingCount = await mongoose.model("Site").countDocuments({ siteId: regex });

    const suffix = String(existingCount + 1).padStart(3, '0');
    this.siteId = `${prefix}-${suffix}`;


    const ledgerId = await syncLedger({
      doc: this,
      type: 'Site',
      fieldsToWatch: ['name', 'address'],
      under: 'Project Accounts',
      getAddress: (doc) => ({
        name: doc.name,
        address: doc.address,
      }),
      getTaxDetails: () => ({}),
    });
    this.ledger = ledgerId;
    next();
  } catch (err) {
    console.error('Error in site ledger sync:', err);
    next(err);
  }
});



const Site = mongoose.model('Site', siteSchema);
module.exports = Site;
