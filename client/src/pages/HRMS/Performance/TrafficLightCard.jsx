import { CheckCircle } from 'lucide-react';

export const TrafficLightCard = ({ percentage }) => {
  // Logic to determine color
  const getColor = (p) => {
    if (p >= 90) return { name: 'GREEN', color: 'bg-green-500', glow: 'shadow-green-400/50' };
    if (p >= 70) return { name: 'AMBER', color: 'bg-amber-400', glow: 'shadow-amber-400/50' };
    return { name: 'RED', color: 'bg-red-500', glow: 'shadow-red-400/50' };
  };

  const status = getColor(percentage);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">Monthly Score</p>
          <h2 className="text-4xl font-extrabold text-slate-900">{percentage}%</h2>
          <p className="mt-2 text-sm text-slate-600">Target: 90% for Bonus</p>
        </div>
        
        {/* The Glowing Light Circle */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${status.color} ${status.glow} animate-pulse`}>
           <CheckCircle className="text-white w-8 h-8 opacity-90" />
        </div>
      </div>
      
      {/* Progress Bar Background */}
      <div className="w-full bg-slate-100 h-2 mt-6 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${status.color}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};