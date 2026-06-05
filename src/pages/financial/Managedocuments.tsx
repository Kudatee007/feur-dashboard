import { useState } from "react";

// ─── Types
type VerificationStatus = "pending" | "under-review" | "needs-info" | "approved" | "rejected";

interface Document { name: string; verified: boolean }

interface VerificationRequest {
  id: string;
  verificationId: string;
  name: string;
  initials: string;
  color: string;
  location: string;
  email: string;
  phone: string;
  submitted: string;
  status: VerificationStatus;
  documents: Document[];
  notes?: string;
}

// ─── Data
const INITIAL_REQUESTS: VerificationRequest[] = [
  { id: "r1", verificationId: "VER001", name: "Kwame Nkrumah", initials: "KN", color: "#4F46E5", location: "Accra, Ghana", email: "kwame.n@email.com", phone: "+233 24 890 1234", submitted: "2024-11-18", status: "pending", documents: [{ name: "License", verified: true }, { name: "Insurance", verified: true }, { name: "Registration", verified: true }, { name: "Photo", verified: true }] },
  { id: "r2", verificationId: "VER002", name: "Oluwaseun Adebayo", initials: "OA", color: "#059669", location: "Lagos, Nigeria", email: "olu.a@email.com", phone: "+234 808 901 2345", submitted: "2024-11-17", status: "needs-info", documents: [{ name: "License", verified: true }, { name: "Insurance", verified: true }, { name: "Registration", verified: false }, { name: "Photo", verified: true }], notes: "Registration document is unclear, please resubmit" },
  { id: "r3", verificationId: "VER003", name: "Amina Diallo", initials: "AD", color: "#DC2626", location: "Dakar, Senegal", email: "amina.d@email.com", phone: "+221 77 234 5678", submitted: "2024-11-16", status: "under-review", documents: [{ name: "License", verified: true }, { name: "Insurance", verified: false }, { name: "Registration", verified: true }, { name: "Photo", verified: true }] },
  { id: "r4", verificationId: "VER004", name: "Chidi Okonkwo", initials: "CO", color: "#7C3AED", location: "Port Harcourt, Nigeria", email: "chidi.o@email.com", phone: "+234 809 012 3456", submitted: "2024-11-15", status: "pending", documents: [{ name: "License", verified: true }, { name: "Insurance", verified: true }, { name: "Registration", verified: true }, { name: "Photo", verified: false }] },
  { id: "r5", verificationId: "VER005", name: "Abena Asante", initials: "AA", color: "#B45309", location: "Kumasi, Ghana", email: "abena.a@email.com", phone: "+233 24 345 6789", submitted: "2024-11-14", status: "approved", documents: [{ name: "License", verified: true }, { name: "Insurance", verified: true }, { name: "Registration", verified: true }, { name: "Photo", verified: true }] },
  { id: "r6", verificationId: "VER006", name: "Emeka Okafor", initials: "EO", color: "#0891B2", location: "Enugu, Nigeria", email: "emeka.o@email.com", phone: "+234 810 123 4567", submitted: "2024-11-13", status: "rejected", documents: [{ name: "License", verified: false }, { name: "Insurance", verified: false }, { name: "Registration", verified: true }, { name: "Photo", verified: true }], notes: "Multiple document discrepancies found" },
];

const STATUS_STYLES: Record<VerificationStatus, string> = {
  "pending": "bg-[#FEF9C2] text-[#894B00] border border-[#FFF085]",
  "under-review": "bg-blue-50 text-blue-700 border border-blue-200",
  "needs-info": "bg-orange-50 text-orange-700 border border-orange-200",
  "approved": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "rejected": "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_LABELS: Record<VerificationStatus, string> = {
  "pending": "Pending Review",
  "under-review": "Under Review",
  "needs-info": "Needs Info",
  "approved": "Approved",
  "rejected": "Rejected",
};

// ─── Request Detail Modal
function RequestDetailModal({ req, onClose, onAction }: { req: VerificationRequest; onClose: () => void; onAction: (id: string, status: VerificationStatus) => void }) {
  // const [noteText, setNoteText] = useState(req.notes ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div><h2 className="font-semibold text-gray-900">Verification Details</h2><p className="text-xs text-gray-400 mt-0.5">{req.verificationId}</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0" style={{ backgroundColor: req.color }}>{req.initials}</div>
            <div>
              <p className="font-semibold text-gray-900">{req.name}</p>
              <p className="text-xs text-gray-400">{req.location}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_STYLES[req.status]}`}>{STATUS_LABELS[req.status]}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Email", value: req.email }, { label: "Phone", value: req.phone }, { label: "Submitted", value: req.submitted }, { label: "Verification ID", value: req.verificationId }].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{item.label}</p><p className="font-semibold text-gray-900 text-sm break-all">{item.value}</p></div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Documents Submitted</p>
            <div className="space-y-2">
              {req.documents.map((doc) => (
                <div key={doc.name} className={`flex items-center justify-between rounded-xl p-3 border ${doc.verified ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                  <span className="text-sm text-gray-700">📄 {doc.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doc.verified ? "text-emerald-700 bg-emerald-100" : "text-red-600 bg-red-100"}`}>{doc.verified ? "✓ Submitted" : "✕ Missing"}</span>
                </div>
              ))}
            </div>
          </div>
          {req.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
              <p className="text-sm text-amber-600">{req.notes}</p>
            </div>
          )}
        </div>
        <div className="px-5 pb-5 space-y-2">
          {req.status !== "approved" && (
            <button onClick={() => { onAction(req.id, "approved"); onClose(); }} className="w-full py-2.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Approve
            </button>
          )}
          {req.status !== "under-review" && req.status !== "approved" && (
            <button onClick={() => { onAction(req.id, "under-review"); onClose(); }} className="w-full py-2.5 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors">Mark as Under Review</button>
          )}
          {req.status !== "needs-info" && req.status !== "approved" && (
            <button onClick={() => { onAction(req.id, "needs-info"); onClose(); }} className="w-full py-2.5 rounded-xl text-sm font-medium border border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors">Request Info</button>
          )}
          {req.status !== "rejected" && req.status !== "approved" && (
            <button onClick={() => { onAction(req.id, "rejected"); onClose(); }} className="w-full py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Reject
            </button>
          )}
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page
type FilterTab = "all" | VerificationStatus;

export default function ManageDocuments() {
  const [requests, setRequests] = useState<VerificationRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<VerificationRequest | null>(null);

  function handleAction(id: string, status: VerificationStatus) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  }

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    underReview: requests.filter((r) => r.status === "under-review").length,
    needsInfo: requests.filter((r) => r.status === "needs-info").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const FILTER_TABS: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: requests.length },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "under-review", label: "Under Review", count: counts.underReview },
    { key: "needs-info", label: "Needs Info", count: counts.needsInfo },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Verification Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and approve driver verification requests</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Pending Review", value: counts.pending, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bg: "bg-amber-50", color: "text-amber-600" },
            { label: "Under Review", value: counts.underReview, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, bg: "bg-blue-50", color: "text-blue-600" },
            { label: "Needs Info", value: counts.needsInfo, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bg: "bg-orange-50", color: "text-orange-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div><p className="text-xs text-gray-400">{s.label}</p><p className="text-2xl font-bold text-gray-900">{s.value}</p></div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto mb-5 pb-0.5">
          {FILTER_TABS.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === t.key ? "bg-[#3894A3] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {t.label}
              {t.count !== undefined && <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Request cards */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm">No requests found</div>
          )}
          {filtered.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0" style={{ backgroundColor: req.color }}>{req.initials}</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">{req.name}</p>
                      <p className="text-sm text-gray-400">{req.location}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[req.status]}`}>{STATUS_LABELS[req.status]}</span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Email", value: req.email },
                    { label: "Phone", value: req.phone },
                    { label: "Verification ID", value: req.verificationId },
                    { label: "Submitted", value: req.submitted },
                  ].map((item) => (
                    <div key={item.label}><p className="text-xs text-gray-400">{item.label}</p><p className="text-sm font-medium text-gray-900 break-all">{item.value}</p></div>
                  ))}
                </div>

                {/* Documents */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Documents Submitted</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {req.documents.map((doc) => (
                      <div key={doc.name} className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium ${doc.verified ? "bg-[#F0FDF4] text-emerald-700" : "bg-red-50 text-red-600 border-red-100"}`}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {doc.verified ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        </svg>
                        {doc.name}
                      </div>
                    ))}
                  </div>
                </div>

                {req.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 text-sm text-amber-700">⚠️ {req.notes}</div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <button onClick={() => setSelected(req)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] text-sm font-medium bg-[#3894A3] hover:bg-[#3899A3] text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    View Details
                  </button>
                  {req.status !== "approved" && (
                    <button onClick={() => handleAction(req.id, "approved")} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] text-sm font-medium bg-[#00A63E] hover:bg-emerald-600 text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Approve
                    </button>
                  )}
                  {req.status !== "needs-info" && req.status !== "approved" && (
                    <button onClick={() => handleAction(req.id, "needs-info")} className="w-full py-2.5 rounded-[7px] text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Request Info</button>
                  )}
                  {req.status !== "rejected" && req.status !== "approved" && (
                    <button onClick={() => handleAction(req.id, "rejected")} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-[7px] text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <RequestDetailModal req={selected} onClose={() => setSelected(null)} onAction={handleAction} />}
    </div>
  );
}