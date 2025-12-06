export default function ProgressBar({ value }) {
  return (
    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800">
      <div
        className="h-2 rounded-full bg-gray-900 dark:bg-gray-100"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
