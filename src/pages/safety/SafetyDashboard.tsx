// src/features/safety/pages/SafetyDashboard.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MOCK_KPIS,
  MOCK_SOS_ALERTS,
  MOCK_DEVIATION_ALERTS,
  MOCK_INCIDENTS,
  MOCK_INCIDENT_DETAILS,
} from "../../features/safety/data/safety.mock";
import type {
  IncidentRow, IncidentType, IncidentStatus, Severity,
  SOSAlert, DeviationAlert,
} from "../../features/safety/types/safety.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<IncidentType, string> = {
  sos:             "bg-red-50 text-red-700",
  harassment:      "bg-orange-50 text-orange-700",
  accident:        "bg-amber-50 text-amber-700",
  route_deviation: "bg-blue-50 text-blue-700",
  theft:           "bg-purple-50 text-purple-700",
};

const TYPE_LABELS: Record<IncidentType, string> = {
  sos:             "SOS",
  harassment:      "Harassment",
  accident:        "Accident",
  route_deviation: "Route Deviation",
  theft:           "Theft",
};

const SEVERITY_STYLES: Record<Severity, string> = {
  high:   "text-red-600 font-semibold",
  medium: "text-amber-600 font-semibold",
  low:    "text-emerald-600 font-semibold",
};

const INCIDENT_STATUS_STYLES: Record<IncidentStatus, string> = {
  investigating: "bg-amber-50 text-amber-700",
  resolved:      "bg-emerald-50 text-emerald-700",
  closed:        "bg-gray-100 text-gray-500",
};

function fmtType(t: IncidentType) {
  return TYPE_LABELS[t] ?? t;
}

const DEV_STATE_STYLES: Record<string, string> = {
  soft_alert:      "bg-amber-100 text-amber-700",
  escalated_alert: "bg-red-100 text-red-700",
  sos_active:      "bg-red-600 text-white",
  on_route:        "bg-emerald-50 text-emerald-700",
};

// ─── SOS Alert Card ───────────────────────────────────────────────────────────

function SOSAlertCard({ alert, onRespond, onDismiss }: {
  alert: SOSAlert;
  onRespond: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const isResponding = alert.status === "responding";

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-red-100 last:border-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
          {alert.passenger.split(" ").map((p) => p[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold text-gray-900 text-sm">{alert.passenger}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isResponding ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
              {isResponding ? "RESPONDING" : "ACTIVE"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {alert.driver}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              {alert.location}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {alert.minutesAgo} mins ago
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {alert.rideId} · GPS: {alert.gps}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onRespond(alert.id)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#3894A3] hover:bg-[#2d7a8a] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          Respond
        </button>
        <button
          onClick={() => onDismiss(alert.id)}
          className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Deviation Alert Row ──────────────────────────────────────────────────────

function DeviationAlertRow({ alert, onView, onConfirmSOS, onRespondNow }: {
  alert: DeviationAlert;
  onView?: () => void;
  onConfirmSOS?: () => void;
  onRespondNow?: () => void;
}) {
  const isSOS       = alert.state === "sos_active";
  const isEscalated = alert.state === "escalated_alert";

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isSOS ? "bg-red-500" : isEscalated ? "bg-orange-500" : "bg-amber-400"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-mono text-xs font-semibold text-gray-700">{alert.id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DEV_STATE_STYLES[alert.state] ?? "bg-gray-100 text-gray-500"}`}>
              {alert.stateLabel}
            </span>
            {alert.timer && (
              <span className="text-[10px] text-gray-400">Timer: {alert.timer}</span>
            )}
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{alert.description}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            <svg className="w-2.5 h-2.5 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            {alert.location} · Trip {alert.tripId} · {alert.time}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {isSOS && (
          <button onClick={onRespondNow} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
            Respond Now
          </button>
        )}
        {isEscalated && (
          <button onClick={onConfirmSOS} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors">
            Confirm / Escalate to SOS
          </button>
        )}
        {!isSOS && !isEscalated && (
          <button onClick={onView} className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
            View
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Incident Detail Modal ────────────────────────────────────────────────────

const INC_TYPE_STYLES: Record<string, string> = {
  sos:             "bg-red-500 text-white",
  harassment:      "bg-orange-500 text-white",
  accident:        "bg-amber-500 text-white",
  route_deviation: "bg-blue-500 text-white",
  theft:           "bg-purple-500 text-white",
};

function IncidentDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const detail = MOCK_INCIDENT_DETAILS[id];
  const [resolved, setResolved] = useState(false);

  if (!detail) return null;

  const canResolve = detail.status === "investigating" && !resolved;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Incident Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Full details for {detail.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* ID + type + status */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-900 text-base">{detail.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">{detail.rideId}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${INC_TYPE_STYLES[detail.type] ?? "bg-gray-200 text-gray-600"}`}>
                  {fmtType(detail.type as IncidentType)}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${INCIDENT_STATUS_STYLES[(resolved ? "resolved" : detail.status) as IncidentStatus]}`}>
                  {resolved ? "Resolved" : detail.status}
                </span>
              </div>
            </div>
          </div>

          {/* Passenger + Driver */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <p className="text-xs text-gray-400">Passenger</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{detail.passenger}</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" /></svg>
                <p className="text-xs text-gray-400">Driver</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{detail.driver}</p>
            </div>
          </div>

          {/* Location + DateTime */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                <p className="text-xs text-gray-400">Location</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{detail.location}</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs text-gray-400">Date & Time</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{detail.dateTime}</p>
            </div>
          </div>

          {/* Description */}
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{detail.description}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3">
            {canResolve && (
              <button
                onClick={() => setResolved(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Mark Resolved
              </button>
            )}
            <button onClick={onClose} className={`${canResolve ? "" : "flex-1"} px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors`}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deviation Alert Modal ────────────────────────────────────────────────────

function DeviationAlertModal({ alert, onClose, onEscalate, onDismiss }: {
  alert: DeviationAlert;
  onClose: () => void;
  onEscalate: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Deviation Alert — {alert.id}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Route deviation details and current status</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* State banner */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${alert.state === "soft_alert" ? "bg-amber-50" : alert.state === "escalated_alert" ? "bg-red-50" : "bg-red-100"}`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${alert.state === "soft_alert" ? "bg-amber-500" : "bg-red-500"}`} />
              <span className={`text-sm font-bold ${alert.state === "soft_alert" ? "text-amber-700" : "text-red-700"}`}>
                {alert.stateLabel}
              </span>
            </div>
            {alert.timer && (
              <span className="text-xs font-medium text-gray-500">Timer: {alert.timer}</span>
            )}
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">{alert.description}</p>

          {/* Grid info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Passenger", value: alert.passenger },
              { label: "Driver",    value: alert.driver },
              { label: "Trip ID",   value: alert.tripId },
              { label: "Time",      value: alert.time },
            ].map((item) => (
              <div key={item.label} className="border border-gray-100 rounded-xl p-3.5">
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="border border-gray-100 rounded-xl p-3.5">
            <p className="text-xs text-gray-400 mb-1">Location</p>
            <p className="font-semibold text-gray-900 text-sm">📍 {alert.location}</p>
            <p className="text-xs text-gray-400 mt-0.5">GPS: {alert.gps}</p>
          </div>

          {/* Status note */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700 leading-relaxed">
              Awaiting passenger/admin dismissal — no action taken yet. Grace timer is running.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onEscalate}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Escalate to SOS
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Dismiss Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type IncidentTypeFilter = "all" | IncidentType;

const TYPE_FILTERS: { key: IncidentTypeFilter; label: string }[] = [
  { key: "all",             label: "All Types" },
  { key: "sos",             label: "SOS" },
  { key: "harassment",     label: "Harassment" },
  { key: "accident",       label: "Accident" },
  { key: "route_deviation", label: "Route Deviation" },
  { key: "theft",           label: "Theft" },
];

export default function SafetyDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<IncidentTypeFilter>("all");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedDeviation, setSelectedDeviation] = useState<DeviationAlert | null>(null);

  const filteredIncidents = MOCK_INCIDENTS.filter((inc) => {
    const matchType = typeFilter === "all" || inc.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || inc.id.toLowerCase().includes(q) || inc.passenger.toLowerCase().includes(q) || inc.driver.toLowerCase().includes(q) || inc.rideId.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Safety & Incidents</h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitor SOS alerts and manage safety incidents across the platform</p>
          </div>
          <button
            onClick={() => navigate("/safety/incidents")}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            SOS
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Active SOS",         value: MOCK_KPIS.activeSOS,      icon: "🚨", bg: "bg-red-50",     iconBg: "bg-red-100" },
            { label: "Investigating",       value: MOCK_KPIS.investigating,  icon: "🔍", bg: "bg-amber-50",   iconBg: "bg-amber-100" },
            { label: "Resolved (30 days)",  value: MOCK_KPIS.resolvedLast30, icon: "✅", bg: "bg-emerald-50", iconBg: "bg-emerald-100" },
            { label: "Total Incidents",     value: MOCK_KPIS.totalIncidents, icon: "📋", bg: "bg-blue-50",    iconBg: "bg-blue-100" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-white shadow-sm p-4 flex items-center justify-between`}>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5">{s.value}</p>
              </div>
              <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center text-lg`}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Active SOS Alerts */}
        <div className="bg-red-50 border border-red-100 rounded-2xl overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-red-100">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="font-semibold text-red-800 text-sm">Active SOS Alerts</span>
          </div>
          <div className="bg-white divide-y divide-red-50">
            {MOCK_SOS_ALERTS.map((alert) => (
              <SOSAlertCard
                key={alert.id}
                alert={alert}
                onRespond={(id) => navigate(`/safety/sos/${id}/respond`)}
                onDismiss={(id) => console.log("dismiss", id)}
              />
            ))}
          </div>
        </div>

        {/* Deviation Alerts */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span className="font-semibold text-gray-900 text-sm">Deviation Alerts</span>
            </div>
            <span className="text-xs text-gray-400">Route-deviation soft alerts & escalations</span>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_DEVIATION_ALERTS.map((alert, i) => (
              <DeviationAlertRow
                key={`${alert.id}-${i}`}
                alert={alert}
                onView={() => setSelectedDeviation(alert)}
                onConfirmSOS={() => navigate(`/safety/sos/${alert.id}/respond`)}
                onRespondNow={() => navigate(`/safety/sos/${alert.id}/respond`)}
              />
            ))}
          </div>
        </div>

        {/* Incident Log */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Incident Log</span>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 px-5 py-3 border-b border-gray-100">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by incident ID, passenger, driver or ride..."
                className="w-full pl-8 pr-4 py-2 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3894A3] focus:border-transparent placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${typeFilter === f.key ? (f.key === "sos" ? "bg-red-500 text-white" : f.key === "harassment" ? "bg-orange-500 text-white" : f.key === "accident" ? "bg-amber-500 text-white" : f.key === "route_deviation" ? "bg-blue-500 text-white" : f.key === "theft" ? "bg-purple-500 text-white" : "bg-[#3894A3] text-white") : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {f.label}
                </button>
              ))}
              <span className="text-xs text-gray-400 mx-1">Status: All ▾</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Incident ID", "Type", "Ride", "Passenger", "Driver", "Location", "Date & Time", "Severity", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredIncidents.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">No incidents found</td></tr>
                ) : filteredIncidents.map((inc: IncidentRow) => (
                  <tr key={inc.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="text-[#3894A3] font-mono text-xs font-semibold">{inc.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[inc.type]}`}>
                        {fmtType(inc.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">{inc.rideId}</td>
                    <td className="px-4 py-3.5 text-gray-900 font-medium whitespace-nowrap">{inc.passenger}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{inc.driver}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{inc.location}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-xs">{inc.dateTime}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs capitalize ${SEVERITY_STYLES[inc.severity]}`}>{inc.severity}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${INCIDENT_STATUS_STYLES[inc.status]}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedIncidentId(inc.id)}
                        className="flex items-center gap-1 text-xs text-[#3894A3] hover:text-[#2d7a8a] font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination stub */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing 1–{filteredIncidents.length} of {MOCK_INCIDENTS.length} incidents</p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-gray-300 cursor-not-allowed"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <button className="w-7 h-7 rounded-lg bg-[#3894A3] text-white text-xs font-medium">1</button>
              <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedIncidentId && (
        <IncidentDetailModal id={selectedIncidentId} onClose={() => setSelectedIncidentId(null)} />
      )}
      {selectedDeviation && (
        <DeviationAlertModal
          alert={selectedDeviation}
          onClose={() => setSelectedDeviation(null)}
          onEscalate={() => { setSelectedDeviation(null); navigate(`/safety/sos/${selectedDeviation.id}/respond`); }}
          onDismiss={() => setSelectedDeviation(null)}
        />
      )}
    </div>
  );
}