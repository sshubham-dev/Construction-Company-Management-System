import React, { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { Chart as ChartJS, BarElement, LineElement, ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import Header from '../../components/Header';

// Register Chart.js components
ChartJS.register(
    BarElement,
    LineElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

const SiteDashboard = () => {
    // State for selected project
    const [selectedProject, setSelectedProject] = useState('Project_2');

    // Sample data for charts (same structure as before but includes dynamic projects)
    const projectData = {
        Project_2: {
            accountsChartData: {
                labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
                datasets: [
                    {
                        label: "Accounts Receivable Turnover",
                        data: [1.37, 1.73, 1.60, 1.56, 1.57, 1.56],
                        backgroundColor: "#4f46e5"
                    },
                    {
                        label: "Accounts Payable Turnover",
                        data: [2.23, 2.80, 2.51, 2.50, 2.45, 2.46],
                        backgroundColor: "#f59e0b"
                    }
                ],
            },
            debtRatiosData: {
                labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
                datasets: [
                    {
                        label: "Debt-to-Asset Ratio",
                        data: [0.57, 0.54, 0.65, 0.58, 0.62, 0.62],
                        borderColor: "#4f46e5",
                        fill: false
                    },
                    {
                        label: "Debt-to-Equity Ratio",
                        data: [1.35, 1.19, 1.82, 1.36, 1.61, 1.61],
                        borderColor: "#f59e0b",
                        fill: false
                    },
                ],
            },
            cashByYearData: {
                labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
                datasets: [
                    {
                        label: "Overall Cash",
                        data: [12600, 24220, 26660, 25940, 25650, 27430],
                        backgroundColor: "#991b1b",
                    }
                ],
            },
            costBreakdownData: {
                labels: ["Equipment", "Foreign Labor", "Labor", "Material"],
                datasets: [
                    {
                        data: [75926, 68386, 79787, 91279],
                        backgroundColor: ["#4f46e5", "#3b82f6", "#10b981", "#f59e0b"],
                    }
                ],
            },
            budgetVarianceData: {
                labels: [
                    "Project_2",
                    "Project_5",
                    "Project_6",
                    "Project_8",
                    "Project_9",
                    "Project_11",
                    "Project_14",
                    "Project_15",
                ],
                datasets: [
                    {
                        label: "Planned",
                        data: [424290, 446720, 521090, 544330, 215190, 349260, 598140, 481850],
                        backgroundColor: "#3b82f6",
                    },
                    {
                        label: "Actual",
                        data: [482000, 460000, 540000, 490000, 200000, 360000, 610000, 470000],
                        backgroundColor: "#f87171",
                    },
                ],
            },
        },
        // Additional projects can follow the same structure...
    };

    // Handle project selection change
    const handleProjectChange = (event) => {
        setSelectedProject(event.target.value);
    };

    const selectedData = projectData[selectedProject];

    return (
        <div>
            <Header category="Page" title="Site Report" />
            <section className="h-full w-full flex justify-center">
                <div className='overflow-x-auto w-full max-w-screen-xl mx-auto'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* Project Dropdown */}
                        <div className="p-2 w-full col-span-3 md:col-span-2 lg:col-span-1">
                            <label className="text-sm text-gray-600" htmlFor="projectSelect">Select Project:</label>
                            <select
                                id="projectSelect"
                                className="w-full p-2 border rounded-md"
                                value={selectedProject}
                                onChange={handleProjectChange}
                            >
                                {Object.keys(projectData).map((project) => (
                                    <option key={project} value={project}>
                                        {project}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Financial Indicators */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 col-span-3 md:col-span-4 lg:col-span-3">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-sm text-gray-600">Quick Ratio</h2>
                                <p className="text-2xl font-bold">1.43</p>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-sm text-gray-600">Current Ratio</h2>
                                <p className="text-2xl font-bold">1.71</p>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-sm text-gray-600">Inventory Turnover Ratio</h2>
                                <p className="text-2xl font-bold">9.20</p>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-sm text-gray-600">Inventory-to-Sales Ratio</h2>
                                <p className="text-2xl font-bold">0.06</p>
                            </div>
                        </div>

                        {/* Other Financial Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 col-span-3 md:col-span-2 lg:col-span-1">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-sm text-gray-600">Working Capital</h2>
                                <p className="text-2xl font-bold">$63.28K</p>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-sm text-gray-600">Cash Balance</h2>
                                <p className="text-2xl font-bold">$2.32M</p>
                                <div className="flex justify-between flex-col lg:flex-row mt-2 text-sm text-gray-600">
                                    <p>Inflow: $3.10M</p>
                                    <p>Outflow: $785.35K</p>
                                </div>
                            </div>
                        </div>

                        {/* Project Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 col-span-3 md:col-span-2 lg:col-span-1">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-sm text-gray-600">Project Completion Rate</h2>
                                <div className="text-2xl font-bold">57.63%</div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-sm text-gray-600">Utilized Duration</h2>
                                <div className="text-2xl font-bold">952 day(s)</div>
                            </div>
                        </div>

                        {/* Performance Indicators */}
                        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <h2 className="text-sm text-gray-600">Schedule Performance (SPI)</h2>
                                <div className="text-2xl font-bold">0.89</div>
                            </div>
                            <div>
                                <h2 className="text-sm text-gray-600">Cost Performance (CPI)</h2>
                                <div className="text-2xl font-bold">1.57</div>
                            </div>
                            <div>
                                <h2 className="text-sm text-gray-600">Schedule Performance (SPI)</h2>
                                <div className="text-2xl font-bold">0.89</div>
                            </div>
                            <div>
                                <h2 className="text-sm text-gray-600">Cost Performance (CPI)</h2>
                                <div className="text-2xl font-bold">1.57</div>
                            </div>
                        </div>

                        {/* Financial Charts */}
                        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-2">
                            <h2 className="text-sm text-gray-600">Accounts Receivable Turnover vs. Accounts Payable Turnover</h2>
                            <Bar data={selectedData.accountsChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-2">
                            <h2 className="text-sm text-gray-600">Debt Ratios</h2>
                            <Line data={selectedData.debtRatiosData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-2">
                            <h2 className="text-sm text-gray-600">Cash by Year</h2>
                            <Doughnut data={selectedData.cashByYearData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-2">
                            <h2 className="text-sm text-gray-600">Cost Breakdown</h2>
                            <Doughnut data={selectedData.costBreakdownData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-2">
                            <h2 className="text-sm text-gray-600">Budget Variance</h2>
                            <Bar data={selectedData.budgetVarianceData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SiteDashboard;
