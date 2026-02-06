import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import MonthlyPerformanceEditor from "./Performance/MonthlyPerformanceEditor";
import CreateMonthlyPerformance from "../../components/CreateMonthlyPerformance";
import { getMonthlyPerformances } from "../../components/MonthlyPerformance/monthlyPerformance.api";


const MonthlyPerformance = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    getMonthlyPerformances().then((res) =>
      setData(res.data)
    );
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Monthly Performance
        </h1>
        <button
          onClick={() =>
            setShowModal(true)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Generate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map((m) => (
          <div
            key={m._id}
            className="border rounded p-4 space-y-2"
          >
            <div className="font-medium">
              {m.employee.name}
            </div>
            <div className="text-sm text-gray-600">
              {m.role} • {m.month}
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  m.trafficLightResult.color === "GREEN"
                    ? "bg-green-100 text-green-700"
                    : m.trafficLightResult.color === "AMBER"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {m.trafficLightResult.color}
              </span>

              <button
                onClick={() =>
                  navigate(
                    `/monthly-performance/${m._id}`
                  )
                }
                className="text-blue-600 text-sm"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={()=> setShowModal(false)}>
        <CreateMonthlyPerformance/>
      </Modal>
    </div>
  );
};

export default MonthlyPerformance;
