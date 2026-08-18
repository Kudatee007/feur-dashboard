// src/features/safety/pages/RouteDeviationDetail.tsx

import { useNavigate } from "react-router-dom";
import { MOCK_ROUTE_DEVIATION } from "../../features/safety/data/safety.mock";

const STEP_STYLES: Record<string, string> = {
  ON_ROUTE:        "bg-emerald-100 text-emerald-700",
  SOFT_ALERT:      "bg-amber-100 text-amber-700",
  ESCALATED_ALERT: "bg-red-500 text-white",
  SOS_ACTIVE:      "bg-gray-100 text-gray-400",
};

export default function RouteDeviationDetail() {
  const navigate = useNavigate();
  const data = MOCK_ROUTE_DEVIATION;

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Back */}
        <button onClick={() => navigate("/safety")} className="flex items-center gap-1.5 text-sm text-[#3894A3] hover:underline mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Safety Incidents
        </button>

        {/* Warning banner */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-3 rounded-2xl mb-6 text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Route deviation ESCALATED — driver not responding · auto-SOS in 43s
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Route Deviation {data.devId}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Driver {data.driver} · Trip {data.tripId} · {data.route}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Deviation Signals */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 text-sm">Deviation Signals</p>
              <span className="text-[10px] text-gray-400">Live from deviation engine · updated 2s ago</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "State",                  value: data.state.toUpperCase().replace("_", " "), highlight: true },
                { label: "Confidence",             value: data.confidence },
                { label: "Distance off nearest route", value: data.distanceOffRoute },
                { label: "Progress to destination", value: data.progressToDestination, warn: true },
                { label: "Consecutive breaches",   value: data.consecutiveBreaches },
                { label: "Corridor status",        value: data.corridorStatus, warn: true },
                { label: "Reroute check",          value: data.rerouteCheck, warn: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 text-xs">{row.label}</span>
                  <span className={`text-xs font-semibold ${row.highlight ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-full" : row.warn ? "text-red-500" : "text-gray-900"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Route & Deviation */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-4">Live Route & Deviation</p>
            {/* Map placeholder */}
            <div className="bg-gray-100 rounded-xl h-44 flex items-center justify-center mb-3 relative">
              <div className="text-center text-xs text-gray-400">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Live deviation map
              </div>
            </div>
            <p className="text-xs text-gray-500">3 route corridors captured at trip start · breadcrumb outside all three</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-6 h-0.5 bg-gray-300 rounded inline-block" />Route corridors
              </span>
              <span className="flex items-center gap-1.5 text-xs text-red-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />Driver (off-route)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Driver Response + Escalation State */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Driver Response */}
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-3">Driver Response</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>In-app prompt sent {data.driverResponse.sentAt}</span>
                <span className="text-red-500 font-medium">· No response</span>
                <span>· {data.driverResponse.elapsed}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {["Traffic diversion", "Road closed", "Passenger asked to stop", "Fuel stop", "Other"].map((reason) => (
                  <button key={reason} className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                    {reason}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                A tap downgrades the alert to ON_ROUTE and logs the reason. Continued silence auto-escalates to SOS_ACTIVE at 90s.
              </p>
            </div>

            {/* Escalation State */}
            <div className="border-t border-gray-100 pt-4">
              <p className="font-semibold text-gray-900 text-sm mb-3">Escalation State</p>
              <div className="flex items-center gap-2 mb-3">
                {data.escalationSteps.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${step.active ? STEP_STYLES[step.label] : "bg-gray-100 text-gray-400"}`}>
                      {step.label.replace("_", " ")}
                    </span>
                    {i < data.escalationSteps.length - 1 && (
                      <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Currently ESCALATED_ALERT · entered 14:41:30. Downgrades to ON_ROUTE on a valid driver reason or 60s back inside a corridor; auto-promotes to SOS_ACTIVE after 90s of silence.
              </p>
            </div>
          </div>

          {/* Response Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-4">Response Actions</p>
            <div className="space-y-3">
              {data.responseActions.map((action) => (
                <div key={action.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{action.label}</span>
                  {action.status ? (
                    <span className="text-xs text-emerald-600 font-medium">{action.status}</span>
                  ) : action.action && (
                    <button className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg transition-colors ${action.color === "red" ? "bg-red-600 hover:bg-red-700" : "bg-[#3894A3] hover:bg-[#2d7a8a]"}`}>
                      {action.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              The engine recommends an operator confirm and impossible action.
            </p>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="font-semibold text-gray-900 text-sm mb-4">Audit Trail</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.auditTrail.map((entry, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3894A3]" />
                <p className="text-xs font-semibold text-gray-900 leading-snug">{entry.event}</p>
                <p className="text-[10px] text-gray-400">{entry.actor}</p>
                <p className="text-[10px] text-gray-400">{entry.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}