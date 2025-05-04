const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const cors = require('cors');
const UserRouter = require('./routes/user.routes');
const Site = require('./routes/site.routes');
const { WorkOrder, WorkDetail } = require('./routes/workorder.routes');
const Employee = require('./routes/employee.routes');
const Client = require('./routes/client.routes');
const Contractor = require('./routes/contractor.routes');
const Checklist = require('./routes/checklist.routes');
const ProjectSchedule = require('./routes/project_Schedule.routes');
const QualitySchedule = require('./routes/quality_Schedule.routes');
const PaymentSchedule = require('./routes/payment_Schedule.routes');
const Bill = require('./routes/bill.routes');
const helmet = require('helmet')
const cookieParser = require('cookie-parser');
const Supplier = require('./routes/supplier.routes');
const ExtraWork = require('./routes/extrawork.routes');
const PurchaseOrder = require('./routes/purchaseorder.routes');
const Todo = require('./routes/todo.routes');
const Approval = require('./routes/approval.routes');
const path = require('path');
const { Attendance, Leave } = require('./routes/attendance.routes');
const Journal = require('./routes/journal.routes');
const Contra = require('./routes/contra.routes');
const Payment = require('./routes/payment.routes');
const Receipt = require('./routes/receipt.routes');
const { Stock, Stock_Group } = require('./routes/stock.routes');
const Return = require('./routes/return.routes');
const Lead = require('./routes/lead.routes');
const { Ledger, Group } = require('./routes/ledger.routes');
const PurchaseRequest = require('./routes/purchaserequest.routes');
const Expenses = require('./routes/expenses.routes');
const Notification = require('./routes/notification.routes');

// midellware
const corsOptions = {
  origin: `${process.env.CORS_ORIGIN}`,
  methods: ['GET', 'HEAD', 'PUT', 'OPTIONS', 'PATCH', 'POST', 'DELETE'],
  credentials: true, // Enable cookies across domains
  secure: true, // Allow credentials only over HTTPS
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
const buildpath = path.join(__dirname, '../client/dist');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(buildpath));
app.use(helmet())

app.use('/api/v1/user', UserRouter);
app.use('/api/v1/attendance', Attendance);
app.use('/api/v1/leave', Leave);
app.use('/api/v1/site', Site);
app.use('/api/v1/work-order', WorkOrder);
app.use('/api/v1/work-details', WorkDetail);
app.use('/api/v1/employee', Employee);
app.use('/api/v1/client', Client);
app.use('/api/v1/contractor', Contractor);
app.use('/api/v1/checklist', Checklist);
app.use('/api/v1/supplier', Supplier);
app.use('/api/v1/extra-work', ExtraWork);
app.use('/api/v1/purchase-order', PurchaseOrder);
app.use('/api/v1/purchase-request', PurchaseRequest);
app.use('/api/v1/project-schedule', ProjectSchedule);
app.use('/api/v1/quality-schedule', QualitySchedule);
app.use('/api/v1/payment-schedule', PaymentSchedule);
app.use('/api/v1/approval', Approval);
app.use('/api/v1/bill', Bill);
app.use('/api/v1/todo', Todo);
app.use('/api/v1/journal', Journal);
app.use('/api/v1/contra', Contra);
app.use('/api/v1/payment', Payment);
app.use('/api/v1/receipt', Receipt);
app.use('/api/v1/stock', Stock);
app.use('/api/v1/stock-group', Stock_Group);
app.use('/api/v1/return', Return);
app.use('/api/v1/lead', Lead);
app.use('/api/v1/ledger', Ledger);
app.use('/api/v1/ledger-group', Group);
app.use('/api/v1/expenses', Expenses);
app.use('/api/v1/notification', Notification)
app.use((err, req, res, next) => {
  console.error(err.stack);
  console.log(err)
  res.status(500).json({ error: 'Internal Server Error' });
});

app.get('/', (req, res) => {
  console.log('Hello world');
  res.status(201).send('Hello World');
});

module.exports = app;