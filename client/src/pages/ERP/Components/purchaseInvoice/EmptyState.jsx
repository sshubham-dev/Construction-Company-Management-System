import { Plus } from "lucide-react";

const EmptyState = ({
  icon,
  title = "No Data Found",
  subtitle = "There is nothing to display.",
  buttonText,
  onClick,
}) => {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed bg-white px-6 text-center">

      {/* Icon */}

      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
        {icon || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-6h13M9 5v6h13M3 5h.01M3 12h.01M3 19h.01"
            />
          </svg>
        )}
      </div>

      {/* Title */}

      <h2 className="text-xl font-semibold text-gray-900">
        {title}
      </h2>

      {/* Subtitle */}

      <p className="mt-2 max-w-md text-sm text-gray-500">
        {subtitle}
      </p>

      {/* Button */}

      {buttonText && (
        <button
          onClick={onClick}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;