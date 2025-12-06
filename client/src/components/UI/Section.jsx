export default function Section({ title, children, className = "" }) {
  return (
    <section
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 ${className}`}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}