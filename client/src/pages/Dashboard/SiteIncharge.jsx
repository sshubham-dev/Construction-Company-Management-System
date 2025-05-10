import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DashboardSection from '../../components/UI/DashboardSection';
import Layout from './Layout';

axios.defaults.withCredentials = true;

const dummyFundData = [
  {
    site: 'Site A',
    received: 100000,
    spent: 65000,
    toReceive: 25000
  },
  {
    site: 'Site B',
    received: 75000,
    spent: 40000,
    toReceive: 30000
  }
];

const dummyTableData = {
  workTarget: [
    { site: 'Site A', work: 'Plastering', date: '2025-05-10', status: 'Upcoming' },
    { site: 'Site B', work: 'Painting', date: '2025-05-05', status: 'Missed' },
  ],
  qualitySchedule: [
    { site: 'Site A', work: 'Safety Training', date: '2025-05-07', status: 'Delayed' }
  ],
  materialOrder: [
    { site: 'Site B', material: 'Cement', date: '2025-05-13', status: 'Upcoming' }
  ],
  housekeeping: [
    { site: 'Site A', date: '2025-05-03', status: 'Done' }
  ],
  extraWork: [
    { site: 'Site B', work: 'Extra Slab', date: '2025-05-28', status: 'Pending' }
  ],
  billSubmission: [
    { week: 'May Week 1', status: 'Submitted', link: '#' }
  ],
  meetings: [
    { date: '2025-05-08', dept: 'Quality', status: 'Held' }
  ]
};

const SiteIncharge = () => {
  const [selectedSite, setSelectedSite] = useState(dummyFundData[0]);
    const { user } = useSelector((state) => state.auth);
    const fundChartData = {
    labels: ['Received', 'Spent', 'Balance', 'To Receive'],
    datasets: [
      {
        label: 'Funds',
        data: [
          selectedSite.received,
          selectedSite.spent,
          selectedSite.received - selectedSite.spent,
          selectedSite.toReceive
        ],
        backgroundColor: ['#4ade80', '#f87171', '#60a5fa', '#facc15'],
        borderWidth: 1
      }
    ]
  };

  return (
    <Layout>
      {/* Balance Fund Table */}
      <DashboardSection
        title="Balance Fund Status"
        viewMode="both" // or "chart" or "table"
        chartType="DoughnutChart"
        columns={['Site', 'Received', 'Spent', 'Balance', 'To Receive']}
        data={dummyFundData.map(site => ({
          site: (
            <button onClick={() => setSelectedSite(site)} className="text-green-700 hover:underline">
              {site.site}
            </button>
          ),
          received: site.received,
          spent: site.spent,
          balance: site.received - site.spent,
          toreceive: site.toReceive
        }))}
        chartData={fundChartData}
      />

      {/* Other Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
        <DashboardSection title="Monthly Work Target" columns={['Site', 'Work', 'Date', 'Status']} data={dummyTableData.workTarget} />
        <DashboardSection title="Quality Schedule" columns={['Site', 'Work', 'Date', 'Status']} data={dummyTableData.qualitySchedule} />
        <DashboardSection title="Material Order" columns={['Site', 'Material', 'Date', 'Status']} data={dummyTableData.materialOrder} />
        <DashboardSection title="Housekeeping Report" columns={['Site', 'Date', 'Status']} data={dummyTableData.housekeeping} />
        <DashboardSection title="Extra Work Report" columns={['Site', 'Work', 'Date', 'Status']} data={dummyTableData.extraWork} />
        <DashboardSection title="Bill Submission" columns={['Week', 'Status', 'Link to Bill']} data={dummyTableData.billSubmission} />
        <DashboardSection title="Meetings with Incharge" columns={['Date', 'Dept', 'Status']} data={dummyTableData.meetings} />
      </div>
    </Layout>
  )
}

export default SiteIncharge