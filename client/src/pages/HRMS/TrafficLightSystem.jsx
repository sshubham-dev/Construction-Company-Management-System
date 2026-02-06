import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertCircle, XCircle, Plus, 
  BarChart3, Users, Calendar, DollarSign, 
  FileText, Upload, RefreshCw 
} from 'lucide-react';

// --- MOCK DATA & SCHEMAS ---

const INITIAL_EMPLOYEE = {
  id: 1,
  name: "Aman Verma",
  role: "Site Supervisor",
  baseSalary: 20000,
  config: {
    greenBonus: 2000,
    redDeduction: 1000,
    siteTargetBonus: 1000
  }
};

// 1. Task Templates (The Rules)
const INITIAL_TEMPLATES = [
  { id: 101, title: "Upload Bill (Wednesday)", frequency: "WEEKLY", deadline: "WEDNESDAY", weight: 1, type: "PROOF", target: null },
  { id: 102, title: "Daily Quality Check", frequency: "DAILY", deadline: "DAILY", weight: 1, type: "CHECKBOX", target: null },
  { id: 103, title: "Weekly Housekeeping", frequency: "WEEKLY", deadline: "SATURDAY", weight: 1, type: "APPROVAL", target: null },
  { id: 104, title: "Site Target Achievement", frequency: "MONTHLY", deadline: "MONTH_END", weight: 2, type: "SYSTEM", target: 5, rewardPerUnit: 1000 },
];

// 2. Task Logs (The Actual Work Instance)
// We will generate these dynamically in the component, but here is the shape:
// { id, templateId, title, status, weight, proofUrl, isBonusTrigger }

const TrafficLightSystem = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [logs, setLogs] = useState([]);
  const [employee] = useState(INITIAL_EMPLOYEE);
  
  // Performance Metrics State
  const [metrics, setMetrics] = useState({
    score: 0,
    color: 'RED',
    totalTasks: 0,
    completedTasks: 0,
    bonus: 0,
    finalPayout: 0
  });

  // --- LOGIC ENGINE ---

  // 1. Simulate "Month Start" (Template -> Log Conversion)
  const generateMonthTasks = () => {
    const newLogs = templates.map((tmpl, index) => ({
      id: Date.now() + index,
      templateId: tmpl.id,
      title: tmpl.title,
      type: tmpl.type,
      weight: tmpl.weight,
      status: 'PENDING', // PENDING, SUBMITTED, APPROVED, COMPLETED
      target: tmpl.target,
      achieved: 0,
      rewardPerUnit: tmpl.rewardPerUnit || 0,
      proof: null
    }));
    setLogs(newLogs);
  };

  // 2. Calculate Traffic Light & Salary
  useEffect(() => {
    if (logs.length === 0) return;

    let totalWeight = 0;
    let achievedWeight = 0;
    let variableBonus = 0;

    logs.forEach(log => {
      // Weight Calculation
      if (log.weight > 0) {
        totalWeight += log.weight;
        if (['APPROVED', 'COMPLETED'].includes(log.status)) {
          achievedWeight += log.weight;
        }
      }

      // Variable Bonus Calculation (e.g., Site Targets)
      if (log.type === 'SYSTEM' && log.rewardPerUnit > 0) {
        variableBonus += (log.achieved * log.rewardPerUnit);
      }
    });

    const percentage = totalWeight === 0 ? 0 : Math.round((achievedWeight / totalWeight) * 100);
    
    // Traffic Light Logic
    let color = 'RED';
    let trafficBonus = -employee.config.redDeduction;
    
    if (percentage >= 90) {
      color = 'GREEN';
      trafficBonus = employee.config.greenBonus;
    } else if (percentage >= 70) {
      color = 'AMBER';
      trafficBonus = 0;
    }

    setMetrics({
      score: percentage,
      color,
      totalTasks: logs.length,
      completedTasks: logs.filter(l => ['APPROVED', 'COMPLETED'].includes(l.status)).length,
      bonus: trafficBonus,
      variableBonus,
      finalPayout: employee.baseSalary + trafficBonus + variableBonus
    });

  }, [logs, employee]);

  // --- ACTIONS ---

  const handleTaskAction = (logId, actionType, value = null) => {
    setLogs(prev => prev.map(log => {
      if (log.id !== logId) return log;

      if (actionType === 'COMPLETE') {
        // Simulating Immediate Approval for Demo
        return { ...log, status: 'COMPLETED' };
      }
      if (actionType === 'UPLOAD') {
        return { ...log, status: 'SUBMITTED', proof: 'image_123.jpg' };
      }
      if (actionType === 'APPROVE') {
        return { ...log, status: 'APPROVED' };
      }
      if (actionType === 'UPDATE_VALUE') {
        // For system metrics like Revenue or Site Targets
        const isTargetMet = value >= log.target;
        return { 
          ...log, 
          achieved: value, 
          status: isTargetMet ? 'COMPLETED' : 'PENDING' 
        };
      }
      return log;
    }));
  };

  const addTemplate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTemplate = {
      id: Date.now(),
      title: formData.get('title'),
      frequency: formData.get('frequency'),
      weight: parseInt(formData.get('weight')),
      type: formData.get('type'),
      target: null
    };
    setTemplates([...templates, newTemplate]);
    e.target.reset();
  };

  // --- UI COMPONENTS ---

  const TrafficLightBadge = ({ color, size = 'md' }) => {
    const colors = {
      GREEN: 'bg-green-500 shadow-green-200',
      AMBER: 'bg-yellow-500 shadow-yellow-200',
      RED: 'bg-red-500 shadow-red-200'
    };
    const dimensions = size === 'lg' ? 'w-16 h-16' : 'w-4 h-4';
    
    return (
      <div className={`rounded-full shadow-lg ${colors[color] || 'bg-gray-300'} ${dimensions} flex items-center justify-center transition-all duration-500`}>
        {size === 'lg' && <span className="text-white font-bold text-xs">{metrics.score}%</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded text-white"><BarChart3 size={20} /></div>
          <h1 className="font-bold text-xl tracking-tight">TrafficLight <span className="text-blue-600">HR</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>Admin Setup</button>
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>Employee Dashboard</button>
          <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'payroll' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>Monthly Payroll</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        
        {/* VIEW 1: ADMIN SETUP */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600"/> Create Task Template
              </h2>
              <form onSubmit={addTemplate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Task Title</label>
                  <input name="title" required placeholder="e.g. Upload Weekly Bill" className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Frequency</label>
                  <select name="frequency" className="w-full border border-slate-300 rounded p-2 text-sm">
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                  <select name="type" className="w-full border border-slate-300 rounded p-2 text-sm">
                    <option value="CHECKBOX">Manual Checkbox</option>
                    <option value="PROOF">Proof Upload</option>
                    <option value="APPROVAL">Manager Approval</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Weight</label>
                  <input name="weight" type="number" defaultValue="1" className="w-full border border-slate-300 rounded p-2 text-sm" />
                </div>
                <div className="md:col-span-5 flex justify-end">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 text-sm">
                    <Plus size={16} /> Add Rule
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Existing Rules (Templates)</h3>
                <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{templates.length} Rules Active</span>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Frequency</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-700">{t.title}</td>
                      <td className="px-6 py-3 text-slate-500">{t.frequency}</td>
                      <td className="px-6 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">{t.type}</span></td>
                      <td className="px-6 py-3 text-slate-500">{t.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: EMPLOYEE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Header: Performance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Traffic Light Status */}
              <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Current Month Performance</p>
                  <h2 className="text-3xl font-bold text-slate-800">{metrics.score}% <span className="text-base font-normal text-slate-400">Score</span></h2>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded font-medium ${metrics.color === 'GREEN' ? 'bg-green-100 text-green-700' : metrics.color === 'AMBER' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {metrics.color} TIER
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">
                      {metrics.color === 'GREEN' ? `Bonus Unlocked: ₹${metrics.bonus}` : metrics.color === 'AMBER' ? 'No Bonus / No Deduction' : `Deduction: ₹${Math.abs(metrics.bonus)}`}
                    </span>
                  </div>
                </div>
                <TrafficLightBadge color={metrics.color} size="lg" />
              </div>

              {/* Quick Simulation Control */}
              <div className="bg-slate-800 text-white p-6 rounded-xl shadow-sm flex flex-col justify-center items-start">
                <h3 className="font-bold mb-2">Simulation Control</h3>
                <p className="text-xs text-slate-300 mb-4">Click to generate dummy tasks for this month based on admin templates.</p>
                <button onClick={generateMonthTasks} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> Start New Month
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Your Tasks</h3>
                <span className="text-sm text-slate-500">{logs.length} Assigned</span>
              </div>
              
              {logs.length === 0 ? (
                <div className="p-10 text-center text-slate-400">No tasks generated yet. Start the month above.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 p-1 rounded ${log.status === 'COMPLETED' || log.status === 'APPROVED' ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'}`}>
                          {log.status === 'COMPLETED' || log.status === 'APPROVED' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{log.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Type: {log.type} • Status: <span className="uppercase">{log.status}</span></p>
                          {log.type === 'SYSTEM' && (
                            <div className="mt-2 text-xs">
                              Progress: {log.achieved} / {log.target}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Action Buttons based on Type */}
                        
                        {/* 1. Manual Checkbox */}
                        {log.type === 'CHECKBOX' && log.status === 'PENDING' && (
                          <button onClick={() => handleTaskAction(log.id, 'COMPLETE')} className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-blue-50 hover:text-blue-600 transition">
                            Mark Done
                          </button>
                        )}

                        {/* 2. Proof Upload */}
                        {log.type === 'PROOF' && log.status === 'PENDING' && (
                          <button onClick={() => handleTaskAction(log.id, 'UPLOAD')} className="px-3 py-1.5 border border-blue-200 text-blue-600 bg-blue-50 rounded text-sm flex items-center gap-2 hover:bg-blue-100 transition">
                            <Upload size={14} /> Upload Proof
                          </button>
                        )}
                        {log.type === 'PROOF' && log.status === 'SUBMITTED' && (
                          <button onClick={() => handleTaskAction(log.id, 'APPROVE')} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                            Simulate Manager Approval
                          </button>
                        )}

                        {/* 3. System Data Fetch */}
                        {log.type === 'SYSTEM' && (
                          <button onClick={() => handleTaskAction(log.id, 'UPDATE_VALUE', (log.achieved || 0) + 1)} className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-100">
                            +1 Add Data
                          </button>
                        )}

                        {/* 4. Manager Approval */}
                        {log.type === 'APPROVAL' && log.status === 'PENDING' && (
                          <button onClick={() => handleTaskAction(log.id, 'UPLOAD')} className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-100">
                            Request Approval
                          </button>
                        )}
                        {log.type === 'APPROVAL' && log.status === 'SUBMITTED' && (
                          <button onClick={() => handleTaskAction(log.id, 'APPROVE')} className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                             Simulate Manager Review
                          </button>
                        )}

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: PAYROLL & REPORT */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
             <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
                <div>
                   <p className="text-slate-400 text-sm mb-1">Final Payout Estimate</p>
                   <h1 className="text-4xl font-bold">₹ {metrics.finalPayout.toLocaleString()}</h1>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Base Salary</p>
                  <p className="font-medium text-lg">₹ {employee.baseSalary.toLocaleString()}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={18}/> Traffic Light Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Total Score</span>
                      <span className="font-bold">{metrics.score}%</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Zone Achieved</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-xs ${metrics.color === 'GREEN' ? 'bg-green-100 text-green-700' : metrics.color === 'AMBER' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{metrics.color}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-slate-500">Performance Adjustment</span>
                      <span className={`font-bold ${metrics.bonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.bonus > 0 ? '+' : ''}{metrics.bonus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign size={18}/> Variable Bonuses</h3>
                  <div className="space-y-4">
                    {logs.filter(l => l.type === 'SYSTEM' && l.rewardPerUnit > 0).map(l => (
                      <div key={l.id} className="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                        <div>
                          <span className="block text-slate-700 font-medium">{l.title}</span>
                          <span className="text-xs text-slate-400">{l.achieved} units x ₹{l.rewardPerUnit}</span>
                        </div>
                        <span className="font-bold text-green-600">+ ₹{l.achieved * l.rewardPerUnit}</span>
                      </div>
                    ))}
                    {metrics.variableBonus === 0 && <p className="text-sm text-slate-400 italic">No variable bonuses achieved yet.</p>}
                  </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrafficLightSystem;