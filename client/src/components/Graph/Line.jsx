import React from 'react'
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title);

const LineChart = ({chartData}) => {
  return (
    <Line data={chartData} />
  )
}

export default LineChart;