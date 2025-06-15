import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import Graphs from '../Graph';


const DashboardSection = ({ title, columns, data, viewMode = 'both', chartType = null, chartData = [] }) => {
  const ChartComponent = chartType && Graphs[chartType];

  return (
    <div className="mt-6 w-full">
      <h2 className="text-xl font-semibold mb-2 text-green-800">{title}</h2>

      {/* Table */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="overflow-auto bg-white shadow rounded-lg scrollbar-hide">
          <table className="min-w-[600px] w-full text-sm">
            <thead className="bg-green-100 text-green-900">
              <tr>
                {columns?.map((col, idx) => (
                  <th key={idx} className="px-4 py-2 border text-left whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.map((row, idx) => (
                <tr key={idx} className="even:bg-green-50">
                  {columns?.map((col, i) => (
                    <td key={i} className="px-4 py-2 border whitespace-nowrap">
                      {col.toLowerCase() === 'link to bill' ? (
                        <NavLink to={row.link} className="text-blue-600"><FiExternalLink /></NavLink>
                      ) : (
                        row[col.toLowerCase().replace(/ /g, '')] || row[col.toLowerCase()]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chart */}
      {(viewMode === 'both' || viewMode === 'chart') && ChartComponent && (
        <div className="bg-white rounded-lg shadow mt-6 p-4">
          <h3 className="text-md font-medium mb-2 text-green-800">
            {title}
            {/* {chartType.replace(/([A-Z])/g, ' $1').trim()} */}
          </h3>
          <div className="w-full md:w-2/3 mx-auto h-72">
            <ChartComponent data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSection;
