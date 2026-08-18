// src/features/safety/pages/SafetyIncidentsQueue.tsx

import { useNavigate } from "react-router-dom";
import { MOCK_SAFETY_INCIDENTS_QUEUE } from "../../features/safety/data/safety.mock";

const BADGE_STYLES: Record<string, string> = {
  SOS_ACTIVE: "bg-red-100 text-red-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  ESCALATED_ALERT: "bg-orange-100 text-orange-700",
};

export default function SafetyIncidentsQueue() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Safety Incidents</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Active SOS alerts and safety event response queue
          </p>
        </div>

        <div className="space-y-3">
          {MOCK_SAFETY_INCIDENTS_QUEUE.map((item) => {
            const isSOS = item.type === "sos";
            const isActive = item.status === "active";
            const isDeviation = item.type === "deviation";

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-4 shadow-sm ${isActive && isSOS ? "border-red-200" : isActive && isDeviation ? "border-amber-200" : "border-gray-100"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white ${isSOS ? (isActive ? "bg-red-500" : "bg-emerald-500") : "bg-amber-500"}`}
                    >
                      {isSOS ? "SOS" : "DEV"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-gray-900 text-sm">
                          {item.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[item.badge] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {item.badge.replace("_", " ")}
                        </span>
                        {item.status === "active" && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            Active
                          </span>
                        )}
                        {item.status === "resolved" && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-snug">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>📍 {item.location}</span>
                        <span>· {item.tripId}</span>
                        <span>· {item.time}</span>
                      </div>
                      {item.emergencyContacts != null && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.emergencyContacts} emergency contact(s) notified
                        </p>
                      )}
                      {item.autoSosIn && (
                        <p className="text-xs text-red-500 font-medium mt-0.5">
                          No driver response · auto-SOS in {item.autoSosIn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {isActive ? (
                      <button
                        onClick={() =>
                          navigate(
                            isSOS
                              ? `/safety/sos/${item.id}/respond`
                              : `/safety/deviation/${item.id}`,
                          )
                        }
                        className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors ${isSOS ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"}`}
                      >
                        Respond Now
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          navigate(`/safety/sos/${item.id}/detail`)
                        }
                        className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
