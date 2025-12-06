export default function KPI({ label, value, sub, positive = true }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</span>
      {sub && (
        <span className={`text-xs ${positive ? "text-emerald-600" : "text-rose-600"}`}>{sub}</span>
      )}
    </div>
  );
}
