import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_SOS_RESPONSE } from "../../features/safety/data/safety.mock";

export default function SOSResponse() {
  const navigate = useNavigate();
  const data = MOCK_SOS_RESPONSE;
  const [note, setNote] = useState("");
  const [authoritiesConfirmed, setAuthoritiesConfirmed] = useState(false);
  const [callActive, setCallActive] = useState(true);
  const [resolved, setResolved] = useState(false);

  if (resolved) {
    return (
      <div className="bg-[#F1F9FB] min-h-screen flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-emerald-500"
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
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Incident Resolved
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The SOS has been marked as resolved. All parties have been notified.
          </p>
          <button
            onClick={() => navigate("/safety")}
            className="w-full py-3 rounded-xl bg-[#3894A3] text-white font-semibold text-sm hover:bg-[#2d7a8a] transition-colors"
          >
            Back to Safety Dashboard
          </button>
        </div>
      </div>
    );
  }

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

        {/* Emergency banner */}
        <div className="flex items-center justify-between bg-red-600 text-white px-5 py-3.5 rounded-2xl mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-white text-red-600 px-2 py-0.5 rounded">
              SOS
            </span>
            <span className="font-bold text-sm">
              ACTIVE EMERGENCY — {data.passenger} (Passenger) requested POLICE
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-bold">LIVE</span>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Safety Incident</h1>
          <p className="text-sm text-gray-500">
            Active emergency — respond and coordinate
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* In-App Call */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 text-sm">In-App Call</p>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                AUTO-CONNECTING
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                {data.passenger
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Calling {data.passenger}...
                </p>
                <p className="text-xs text-gray-500">
                  Connecting to passenger who triggered the SOS
                </p>
                <p className="text-xs font-mono text-gray-400 mt-0.5">
                  {callActive ? "00:04" : "Call ended"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCallActive(false)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                End Call
              </button>
              <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                Mute
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-3">
              ⚠ Assess discreetly if the driver may be the threat.
            </p>
          </div>

          {/* Live Location */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 text-sm">
                Live Location
              </p>
              <span className="text-[10px] font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full">
                Deviation confidence: High
              </span>
            </div>
            {/* Map placeholder */}
            <div className="bg-gray-100 rounded-xl h-36 flex items-center justify-center mb-3 relative overflow-hidden">
              <div className="text-xs text-gray-400 text-center">
                <svg
                  className="w-8 h-8 text-gray-300 mx-auto mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Live map — GPS: {data.gps}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Victoria Island, Lagos · GPS {data.gps}
            </p>
            <p className="text-xs text-red-500 font-medium mt-1">
              Driver · 210 m off route
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Escalation */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-4">
              Escalation (based on selection: POLICE)
            </p>
            <div className="border border-red-100 bg-red-50 rounded-xl p-3.5 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-900">
                  Police / Emergency Services
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                  INITIATING
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {data.escalation.note}
              </p>
              <button
                onClick={() => setAuthoritiesConfirmed(true)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${authoritiesConfirmed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-[#3894A3] hover:bg-[#2d7a8a] text-white"}`}
              >
                {authoritiesConfirmed
                  ? "✓ Authorities Confirmed"
                  : "Confirm Authorities Engaged"}
              </button>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-4">
              Trip Details
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Passenger", value: data.passenger },
                { label: "Driver", value: data.driver },
                { label: "Trip ID", value: data.tripId },
                { label: "Route", value: data.route },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-400">{row.label}</span>
                  <span className="font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
          <p className="font-semibold text-gray-900 text-sm mb-1">
            Emergency Contacts on File
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Contact after assessing the situation on the call.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.emergencyContacts.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center justify-between border border-gray-100 rounded-xl p-3.5"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {contact.name} · {contact.relation}
                  </p>
                  <p className="text-xs text-gray-400">{contact.phone}</p>
                </div>
                <button className="px-3 py-1.5 text-xs font-semibold bg-[#3894A3] hover:bg-[#2d7a8a] text-white rounded-lg transition-colors">
                  Call / Notify
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Response Log */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="font-semibold text-gray-900 text-sm mb-4">
            Response Log & Resolution
          </p>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Log what's happening..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3894A3] focus:border-transparent"
            />
            <button className="px-4 py-2.5 text-sm font-medium border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
              Add Note
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setResolved(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Mark Resolved (Safe)
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Escalate Further
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
