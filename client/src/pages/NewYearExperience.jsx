import { useEffect, useState } from "react";

// --------------------
// Utility: server-synced time (mocked)
// --------------------
const getNow = () => new Date();

// --------------------
// Status-bar style Countdown Banner (forced, safe-area aware)
// --------------------
function NewYearStatusBanner({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(targetDate - getNow());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(targetDate - getNow());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft <= 0) return null;

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div
      className=" inset-x-0 z-50 bg-black text-white/90 backdrop-blur-md border-b border-white/20 mb-4 rounded-md"
      //   style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium">Countdown</span>
        <span className="text-sm font-semibold tracking-wider">
          {hours}:{minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

// --------------------
// Happy New Year Overlay (1st Jan - friendly tone)
// --------------------
function HappyNewYearOverlay({ userName, onDone }) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
      {/* Decorative glow elements */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 -right-24 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-200" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" />

      {/* Main content */}
      <div className="relative text-center px-6 max-w-md">
        <div className="text-5xl mb-4">🎉</div>

        <h1 className="text-3xl font-bold tracking-wide">
          Happy New Year 2026
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Hey <span className="text-white font-medium">{userName}</span>,
        </p>

        <p className="mt-5 text-sm text-gray-400 leading-relaxed">
          Just a quick note to say thank you. Your trust, consistency, and
          support helped us move forward and improve every single day.
        </p>

        <p className="mt-4 text-sm text-gray-400">
          We’re genuinely excited to build even better things with you this
          year.
        </p>

        <div className="mt-10">
          <button
            onClick={onDone}
            className="relative inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold
                     bg-white text-black transition
                     hover:scale-105 hover:bg-gray-200
                     active:scale-95"
          >
            Let’s Start 2026 →
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------
// Main Wrapper
// --------------------
export default function NewYearExperience({ user }) {
  const [showOverlay, setShowOverlay] = useState(false);

  const now = getNow();
  const isDec31 = now.getDate() === 31 && now.getMonth() === 11;
  //   const isJan1 = now.getDate() === 1 && now.getMonth() === 0;

  const targetDate = new Date("2026-01-01T00:00:00");
  const hasSeenNewYear = () => {
    return localStorage.getItem("new_year_2026_seen") === "true";
  };
  const isEventActive = () => {
    const today = new Date();
    return today.getMonth() === 0 && today.getDate() === 2;
  };

  useEffect(() => {
    // Only show once, based on localStorage
    if (isEventActive() && !hasSeenNewYear()) {
      setShowOverlay(true);
    }
  }, []);

  const handleOverlayDone = () => {
    localStorage.setItem("new_year_2026_seen", "true");
    setShowOverlay(false);
  };

  return (
    <>
      {isDec31 && <NewYearStatusBanner targetDate={targetDate} />}

      {showOverlay && (
        <HappyNewYearOverlay
          userName={user?.userName || "there"}
          onDone={handleOverlayDone}
        />
      )}
    </>
  );
}
