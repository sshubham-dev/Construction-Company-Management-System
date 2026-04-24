const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const cors = require("cors");
const UserRouter = require("./routes/user.routes");
const Site = require("./routes/site.routes");
const {
  WorkOrder,
  WorkDetail,
  WorkTemplate,
} = require("./routes/workorder.routes");
const Employee = require("./routes/employee.routes");
const Client = require("./routes/client.routes");
const Contractor = require("./routes/contractor.routes");
const Checklist = require("./routes/checklist.routes");
const ProjectSchedule = require("./routes/project_Schedule.routes");
const QualitySchedule = require("./routes/quality_Schedule.routes");
const PaymentSchedule = require("./routes/payment_Schedule.routes");
const Bill = require("./routes/bill.routes");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const Supplier = require("./routes/supplier.routes");
const ExtraWork = require("./routes/extrawork.routes");
const PurchaseOrder = require("./routes/purchaseorder.routes");
const Todo = require("./routes/todo.routes");
const Approval = require("./routes/approval.routes");
const path = require("path");
const {
  Attendances,
  Leaves,
  LabourAttendances,
} = require("./routes/attendance.routes");
const Journal = require("./routes/journal.routes");
const Contra = require("./routes/contra.routes");
const Payment = require("./routes/payment.routes");
const Receipt = require("./routes/receipt.routes");
const { Stock, Stock_Group } = require("./routes/stock.routes");
const Return = require("./routes/return.routes");
const Lead = require("./routes/lead.routes");
const { Ledger, Group, CostCenter } = require("./routes/ledger.routes");
const PurchaseRequest = require("./routes/purchaserequest.routes");
const Expenses = require("./routes/expenses.routes");
const Notification = require("./routes/notification.routes");
const Blogs = require("./routes/blog.routes");
const BusinessUnit = require("./routes/bu.routes");
const Store = require("./routes/store.routes");
const { Rates, Quotation, Packages } = require("./routes/quote.routes");
const timing = require("./middlewares/timing.middleware");
const MonthlyPerformance = require("./routes/monthlyperformance.routes");
const GRN = require("./routes/grn.routes");
const DN = require("./routes/dn.routes");
const SalesInvoice = require("./routes/salesinvoice.routes");
const CollectionRoute = require("./routes/collection.routes");
const FAQs = require("./routes/faq.routes");
const Payroll = require("./routes/payroll.routes");
const PayChallan = require("./routes/paychallan.routes");
const Projects = require("./routes/project.routes");
const Company = require("./routes/company.routes");
const Reports = require("./routes/report.routes");
// midellware

const allowedOrigins = process.env.CORS_ORIGIN.split(",");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "HEAD", "PUT", "OPTIONS", "PATCH", "POST", "DELETE"],
  credentials: true,
  secure: true,
  // allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-csrf-token'],
  // exposedHeaders: ['set-cookie', 'Content-Range', 'X-Content-Range', 'Authorization'],
};

app.use(cors(corsOptions));
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://bhuvi-manager.onrender.com');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//   res.header('Access-Control-Request-Headers', 'https://bhuvi-manager.onrender.com');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   res.header('Access-Control-Allow-Credentials', 'true'); // Set to 'true' if using credentials
//   next();
// });
const buildpath = path.join(__dirname, "../client/dist");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(express.static(buildpath));
app.use(helmet());
app.use(timing);
// app.use(async (req, res, next) => {
//   const start = process.hrtime.bigint();
//   res.on('finish', () => {
//     const ms = Number(process.hrtime.bigint() - start) / 1e6;
//     console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(2)}ms`);
//   });
//   next();
// });

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/attendance", Attendances);
app.use("/api/v1/leave", Leaves);
app.use("/api/v1/site", Site);
app.use("/api/v1/work-order", WorkOrder);
app.use("/api/v1/work-details", WorkDetail);
app.use("/api/v1/employee", Employee);
app.use("/api/v1/client", Client);
app.use("/api/v1/contractor", Contractor);
app.use("/api/v1/checklist", Checklist);
app.use("/api/v1/supplier", Supplier);
app.use("/api/v1/extra-work", ExtraWork);
app.use("/api/v1/purchase-order", PurchaseOrder);
app.use("/api/v1/purchase-request", PurchaseRequest);
app.use("/api/v1/project-schedule", ProjectSchedule);
app.use("/api/v1/quality-schedule", QualitySchedule);
app.use("/api/v1/payment-schedule", PaymentSchedule);
app.use("/api/v1/approval", Approval);
app.use("/api/v1/bill", Bill);
app.use("/api/v1/todo", Todo);
app.use("/api/v1/journal", Journal);
app.use("/api/v1/contra", Contra);
app.use("/api/v1/payment", Payment);
app.use("/api/v1/receipt", Receipt);
app.use("/api/v1/stock", Stock);
app.use("/api/v1/stock-group", Stock_Group);
app.use("/api/v1/return", Return);
app.use("/api/v1/lead", Lead);
app.use("/api/v1/ledger", Ledger);
app.use("/api/v1/cost-center", CostCenter);
app.use("/api/v1/ledger-group", Group);
app.use("/api/v1/expenses", Expenses);
app.use("/api/v1/notification", Notification);
app.use("/api/v1/blogs", Blogs);
app.use("/api/v1/labour-attendance", LabourAttendances);
app.use("/api/v1/work-template", WorkTemplate);
app.use("/api/v1/business-unit", BusinessUnit);
app.use("/api/v1/store", Store);
app.use("/api/v1/calculator/quote", Quotation);
app.use("/api/v1/calculator/rate", Rates);
app.use("/api/v1/calculator/packages", Packages);
app.use("/api/v1/monthly-performance", MonthlyPerformance);
app.use("/api/v1/grn", GRN);
app.use("/api/v1/delivery-note", DN);
app.use("/api/v1/sales-invoice", SalesInvoice);
app.use("/api/v1/collection", CollectionRoute);
app.use("/api/v1/faq", FAQs);
app.use("/api/v1/payroll", Payroll);
app.use("/api/v1/payment-challans", PayChallan);
app.use("/api/v1/projects", Projects);
app.use("/api/v1/company", Company);
app.use("/api/v1/reports", Reports)
app.use((err, req, res, next) => {
  console.error(err.stack);
  console.log(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// app.get("/", (req, res) => {
//   console.log("Hello world");
//   res.status(201).send("Hello World");
// });

module.exports = app;
