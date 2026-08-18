// src/features/safety/pages/SOSIncidentDetail.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_SOS_INCIDENT_DETAIL } from "../../features/safety/data/safety.mock";

export default function SOSIncidentDetail() {
  const navigate = useNavigate();
  const data = MOCK_SOS_INCIDENT_DETAIL;
  const [note, setNote] = useState("");

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Back */}
        <button
          onClick={() => navigate("/safety")}
          className="flex items-center gap-1.5 text-sm text-[#3894A3] hover:underline mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Safety Incidents
        </button>

        {/* Resolution banner */}
        {data.resolution && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl mb-6 text-sm font-medium">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Resolved — passenger confirmed safe · closed{" "}
            {data.resolution.resolvedAt}
          </div>
        )}

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">SOS {data.sosId}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Triggered by {data.triggeredBy} ·{" "}
            {data.status === "resolved" ? "Case closed" : "Active"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Incident Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-4">
              Incident Info
            </p>
            <div className="space-y-3">
              {[
                { label: "Triggered by", value: data.triggeredBy },
                { label: "Driver", value: data.driver },
                { label: "Trip", value: data.tripId },
                { label: "Time", value: data.time },
                { label: "Last known location", value: data.lastLocation },
                { label: "Status", value: data.status },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-400">{row.label}</span>
                  <span
                    className={`font-medium ${row.label === "Status" ? "text-emerald-600 text-xs px-2 py-0.5 bg-emerald-50 rounded-full" : "text-gray-900"}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-[#3894A3] font-medium hover:underline flex items-center gap-1">
              View linked trip →
            </button>
          </div>

          {/* Emergency Contacts Notified */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-4">
              Emergency Contacts Notified
            </p>
            {data.emergencyContactsNotified.map((c) => (
              <div
                key={c.name}
                className="flex items-start justify-between border-b border-gray-50 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {c.name} · {c.relation}
                  </p>
                  <p className="text-xs text-gray-400">
                    {c.phone} · notified {c.notifiedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution */}
        {data.resolution && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-900 text-sm">Resolution</p>
              <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4"
                  />
                </svg>
                Resolved
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">
              {data.resolution.resolvedBy} · {data.resolution.resolvedAt}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {data.resolution.note}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Investigation Notes */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-4">
              Investigation Notes
            </p>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add note..."
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3894A3] focus:border-transparent"
              />
              <button className="px-3 py-2 text-xs font-medium bg-[#3894A3] text-white rounded-lg hover:bg-[#2d7a8a] transition-colors">
                Add
              </button>
            </div>
            {data.investigationNotes.map((n, i) => (
              <p
                key={i}
                className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed"
              >
                {n}
              </p>
            ))}
          </div>

          {/* Audit Trail */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-4">
              Audit Trail
            </p>
            <div className="space-y-4">
              {data.auditTrail.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3894A3] flex-shrink-0 mt-0.5" />
                    {i < data.auditTrail.length - 1 && (
                      <div
                        className="w-0.5 flex-1 bg-gray-200 mt-1.5 mb-0"
                        style={{ minHeight: 20 }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {entry.event}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {entry.actor} · {entry.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
