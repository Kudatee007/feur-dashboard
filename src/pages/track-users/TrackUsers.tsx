import { useState } from "react";
import Passengers from "../passengers/Passengers";
import Drivers from "../drivers/Drivers";

// ─── Main Page
type MainTab = "passengers" | "drivers";

export default function TrackUsers() {
  const [tab, setTab] = useState<MainTab>("passengers");

  return (
    <div className="bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Track Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor and track all users on the platform</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {(["passengers", "drivers"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${tab === t ? "bg-white border border-gray-200 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/60"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "passengers" ? <Passengers /> : <Drivers />}
      </div>
    </div>
  );
}