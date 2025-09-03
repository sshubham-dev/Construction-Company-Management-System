import React, { Suspense } from 'react';
import Header from '../../components/Header';
import toast, { Toaster } from 'react-hot-toast';
const AreaChart = React.lazy(() => import('../../components/Graph/AreaChart'));
const BubbleChart = React.lazy(() => import('../../components/Graph/BubbleChart'));
const DoughnutChart = React.lazy(() => import('../../components/Graph/DoughnutChart'));
const EventChart = React.lazy(() => import('../../components/Graph/EventChart'));
const GradientChart = React.lazy(() => import('../../components/Graph/GradientChart'));
const GroupedBarChart = React.lazy(() => import('../../components/Graph/GroupedBarChart'));
const HBarChart = React.lazy(() => import('../../components/Graph/HBarChart'));
const LineChart = React.lazy(() => import('../../components/Graph/LineChart'));
const MultiAxisLineChart = React.lazy(() => import('../../components/Graph/MultiAxisLineChart'));
const MultiTypeChart = React.lazy(() => import('../../components/Graph/MultiTypeChart'));
const PieChart = React.lazy(() => import('../../components/Graph/PieChart'));
const PolarAreaChart = React.lazy(() => import('../../components/Graph/PolarAreaChart'));
const RadarChart = React.lazy(() => import('../../components/Graph/RadarChart'));
const ScatterChart = React.lazy(() => import('../../components/Graph/ScatterChart'));
const StackedBarChart = React.lazy(() => import('../../components/Graph/StackedBarChart'));
const VBarChart = React.lazy(() => import('../../components/Graph/VBarChart'));


const Ex = () => {
    return (
        <div >
            <Header category="Page" title="Expenses" />
            <section className="h-full w-full mb-16 flex justify-center">
                <div className='overflow-x-auto w-full max-w-screen-xl mx-auto'>
                    <Suspense fallback={<div>Loading...</div>}>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">AreaChart</h2>
                                <AreaChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">BubbleChart</h2>
                                <BubbleChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">LineChart</h2>
                                <LineChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">VBarChart</h2>
                                <VBarChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">HBarChart</h2>
                                <HBarChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">EventChart</h2>
                                <EventChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">MultiAxisLineChart</h2>
                                <MultiAxisLineChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">GroupedBarChart</h2>
                                <GroupedBarChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">DoughnutChart</h2>
                                <DoughnutChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">PieChart </h2>
                                <PieChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">PolarAreaChart</h2>
                                <PolarAreaChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">RadarChart</h2>
                                <RadarChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">ScatterChart</h2>
                                <ScatterChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">StackedBarChart</h2>
                                <StackedBarChart />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h2 className="text-lg text-gray-600">MultiTypeChart</h2>
                                <MultiTypeChart />
                            </div>
                        </div>
                    </Suspense>
                </div>
                <Toaster position="top-right" reverseOrder={false} />
            </section>
        </div>
    );
};

export default Ex;
