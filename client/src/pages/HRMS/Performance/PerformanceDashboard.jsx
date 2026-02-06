import { useEffect, useState } from 'react';
import { TrafficLightCard } from './TrafficLightCard';
import StatusBadge from './StatusBadge';
import { Button } from './StatusBadge';
// import { TaskService } from '../services/api';

const PerformanceDashboard =() => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate score on the fly
  const score = tasks.length 
    ? Math.round((tasks.filter(t => t.status === 'APPROVED').length / tasks.length) * 100) 
    : 0;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
    //   const data = await TaskService.getMyTasks('2023-10');
    //   setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      
      {/* 1. Header Area */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">My Performance</h1>
        <span className="text-slate-500">October 2023</span>
      </div>

      {/* 2. Visual Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrafficLightCard percentage={score} />
        {/* You can add a Revenue Card here */}
      </div>

      {/* 3. The Task List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gray-50">
          <h3 className="font-semibold text-slate-700">Today's Checklist</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {tasks.map(task => (
            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
              <div>
                <p className="font-medium text-slate-800">{task.title}</p>
                <p className="text-xs text-slate-500 mt-1">Due: {task.deadline}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <StatusBadge status={task.status} />
                
                {task.status === 'PENDING' && (
                  <Button variant="outline" size="sm">
                     Upload Proof
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PerformanceDashboard