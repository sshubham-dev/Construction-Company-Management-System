import {
  FiPlusCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";

const EVENT_CONFIG = {
  CREATED: {
    title: "Voucher Created",
    icon: FiPlusCircle,
    color: "text-blue-600 bg-blue-100",
  },

  POSTED: {
    title: "Voucher Posted",
    icon: FiCheckCircle,
    color: "text-green-600 bg-green-100",
  },

  CANCELLED: {
    title: "Voucher Cancelled",
    icon: FiXCircle,
    color: "text-red-600 bg-red-100",
  },

  UPDATED: {
    title: "Voucher Updated",
    icon: FiClock,
    color: "text-orange-600 bg-orange-100",
  },
};

export default function TimelineCard({ voucher }) {
  const events = [];

  if (voucher?.createdAt) {
    events.push({
      type: "CREATED",
      user: voucher?.createdBy?.userName,
      date: voucher?.createdAt,
    });
  }

  if (voucher?.updatedAt) {
    events.push({
      type: "UPDATED",
      user: voucher?.updatedBy?.userName,
      date: voucher?.updatedAt,
    });
  }

  if (voucher?.postedAt) {
    events.push({
      type: "POSTED",
      user: voucher?.postedBy?.userName,
      date: voucher?.postedAt,
    });
  }

  if (voucher?.cancelledAt) {
    events.push({
      type: "CANCELLED",
      user: voucher?.cancelledBy?.userName,
      date: voucher?.cancelledAt,
    });
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Activity Timeline</h2>
      </div>

      <div className="p-5">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No activity available.</p>
        ) : (
          <div className="space-y-5">
            {events.map((event, index) => {
              const config = EVENT_CONFIG[event?.type];

              const Icon = config?.icon;

              return (
                <div key={index} className="flex gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${config?.color}`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{config?.title}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      By{" "}
                      <span className="font-medium">{event?.user || "-"}</span>
                    </p>

                    <p className="text-xs text-gray-400">
                      {formatDate(event?.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
