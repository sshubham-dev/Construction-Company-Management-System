# Construction Company Management System (MERN Stack) 🚧

## Overview:
The Construction Company Management System (CCMS) is a professional-grade software designed for real-world application in the construction industry. Built using the MERN stack (MongoDB, Express.js, React.js, Node.js), it offers comprehensive tools to manage construction projects, streamline workflows, and ensure operational efficiency.

## Features:

### 1. Project Management 🏗️
- **Site Details:**
  - Manage detailed profiles for multiple construction sites.
  - Track progress and maintain historical records.
- **Project Scheduling:**
  - Define timelines, set milestones, and receive notifications for deadlines.

### 2. Payment Management 💰
- **Payment Schedules:**
  - Define, monitor, and automate payment reminders.
- **Bill Creation:**
  - Generate invoices for clients and monitor payment status.

### 3. Stakeholder Management 🤝
- **Clients:**
  - Maintain contact details and track project histories.
- **Employees:**
  - Manage roles, responsibilities, and attendance.
- **Contractors and Suppliers:**
  - Organize records of contractors and suppliers, including procurement details.

### 4. Procurement and Quality Assurance ✅
- **Purchase Orders:**
  - Create and track procurement processes.
- **Quality Checks:**
  - Schedule, document, and integrate quality assurance feedback.

### 5. Extra Work and Approvals 📝
- Document and approve additional work and budgets seamlessly.
- Notifications for timely decision-making.

### 6. Attendance Management 🕒
- Monitor attendance and generate HR reports.

## Technical Details 🔧
- **Frontend:** React.js
- **Backend:** Node.js and Express.js
- **Database:** MongoDB
- **Authentication:** JWT-based system with role-based access control.
- **Deployment:** Manual deployment in production environments.

## Installation and Setup 📦

### Prerequisites:
- Node.js and npm installed.
- MongoDB instance running locally or on a server.

### Steps:
1. Clone the repository:
   ```
   git clone [repository_url]
   ```
2. Install backend dependencies:
   ```
   cd project-directory
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd client
   npm install
   ```
4. Start the application:
   ```
   npm run dev
   ```
   This starts both the backend and frontend servers.

5. Open the application in a browser at `http://localhost:3000`.

## Deployment 🚀
For deploying in a production environment:
- Ensure all environment variables for database connection and authentication are configured.
- Use a Node.js process manager (e.g., PM2) to run the backend server.
- Deploy the frontend build files to a web server (e.g., Nginx or Apache).

## Known Issues 🐛
- Performance optimization for datasets exceeding 10,000 records is ongoing.
- Minor UI inconsistencies may occur on older browsers.

## Future Roadmap 🛤️
- Develop a mobile application for site-level operations.
- Integrate with accounting software.
- Advanced reporting and analytics.
- Real-time collaboration tools.

## Feedback and Support 📬
For feedback or support, reach out to us at shubhamkrg1819@gmail.com.

## Developer 👨‍💻
Developed and maintained by [@sshubham-dev](https://github.com/sshubham-dev).

---



- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh