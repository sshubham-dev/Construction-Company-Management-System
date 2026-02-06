const variants = {
  GREEN: 'bg-green-100 text-green-700 border-green-200',
  AMBER: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  RED: 'bg-red-100 text-red-700 border-red-200',
  PENDING: 'bg-slate-100 text-slate-600 border-slate-200',
};

const StatusBadge =({ status, className }) => {
  // Fallback to PENDING if status is unknown
  const style = variants[status] || variants.PENDING;
  
  return (
    <span className={twMerge("px-2.5 py-0.5 rounded-full text-xs font-bold border", style, className)}>
      {status}
    </span>
  );
}

export function Button({ variant = 'primary', children, ...props }) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm";
  
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    success: "bg-green-600 text-white hover:bg-green-700",
  };

  return (
    <button className={`${baseStyle} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}

export default StatusBadge