import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type VehicleStatus = "verified" | "pending" | "rejected";

interface Vehicle {
  id: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  year: number;
  make: string;
  model: string;
  plateNumber: string;
  color: string;
  registered: string;
  lastUsed: string | null;
  status: VehicleStatus;
  documents: { name: string; verified: boolean }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const VEHICLES: Vehicle[] = [
  { id: "PV001", owner: "Sarah Johnson", ownerInitials: "SJ", ownerColor: "#4F46E5", year: 2020, make: "Toyota", model: "Camry", plateNumber: "LAG-234-AB", color: "Silver", registered: "2024-01-15", lastUsed: "2024-11-19", status: "verified", documents: [{ name: "Registration", verified: true }, { name: "Insurance", verified: true }, { name: "Roadworthiness", verified: true }] },
  { id: "PV002", owner: "Amara Nwankwo", ownerInitials: "AN", ownerColor: "#059669", year: 2019, make: "Honda", model: "Accord", plateNumber: "ABJ-567-CD", color: "Black", registered: "2024-02-20", lastUsed: "2024-11-19", status: "verified", documents: [{ name: "Registration", verified: true }, { name: "Insurance", verified: true }, { name: "Roadworthiness", verified: true }] },
  { id: "PV003", owner: "Grace Osei", ownerInitials: "GO", ownerColor: "#7C3AED", year: 2021, make: "BMW", model: "3 Series", plateNumber: "ACC-890-EF", color: "White", registered: "2024-03-10", lastUsed: "2024-11-18", status: "verified", documents: [{ name: "Registration", verified: true }, { name: "Insurance", verified: true }, { name: "Roadworthiness", verified: true }] },
  { id: "PV004", owner: "John Akpan", ownerInitials: "JA", ownerColor: "#DC2626", year: 2022, make: "Mercedes-Benz", model: "C-Class", plateNumber: "PH-123-GH", color: "Blue", registered: "2024-11-18", lastUsed: null, status: "pending", documents: [{ name: "Registration", verified: true }, { name: "Insurance", verified: false }, { name: "Roadworthiness", verified: false }] },
  { id: "PV005", owner: "Daniel Opoku", ownerInitials: "DO", ownerColor: "#B45309", year: 2020, make: "Toyota", model: "Corolla", plateNumber: "KUM-456-IJ", color: "Red", registered: "2024-04-05", lastUsed: "2024-11-17", status: "verified", documents: [{ name: "Registration", verified: true }, { name: "Insurance", verified: true }, { name: "Roadworthiness", verified: true }] },
  { id: "PV006", owner: "Fatima Hassan", ownerInitials: "FH", ownerColor: "#0891B2", year: 2019, make: "Nissan", model: "Altima", plateNumber: "KAN-789-KL", color: "Grey", registered: "2024-05-12", lastUsed: "2024-11-18", status: "verified", documents: [{ name: "Registration", verified: true }, { name: "Insurance", verified: true }, { name: "Roadworthiness", verified: true }] },
  { id: "PV007", owner: "Blessing Adeyemi", ownerInitials: "BA", ownerColor: "#065F46", year: 2018, make: "Hyundai", model: "Elantra", plateNumber: "IB-321-MN", color: "White", registered: "2024-06-20", lastUsed: "2024-11-16", status: "verified", documents: [{ name: "Registration", verified: true }, { name: "Insurance", verified: true }, { name: "Roadworthiness", verified: true }] },
  { id: "PV008", owner: "Peter Mwale", ownerInitials: "PM", ownerColor: "#BE185D", year: 2018, make: "Nissan", model: "Altima", plateNumber: "ZM-789-OP", color: "Silver", registered: "2024-07-08", lastUsed: "2024-11-15", status: "rejected", documents: [{ name: "Registration", verified: true }, { name: "Insurance", verified: false }, { name: "Roadworthiness", verified: false }] },
];

const STATUS_STYLES: Record<VehicleStatus, string> = {
  verified: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
};

// ─── Vehicle Detail Modal ─────────────────────────────────────────────────────

function VehicleDetailModal({ vehicle, onClose, onStatusChange }: { vehicle: Vehicle; onClose: () => void; onStatusChange: (id: string, status: VehicleStatus) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div><h2 className="font-semibold text-gray-900">Vehicle Details</h2><p className="text-xs text-gray-400 mt-0.5">{vehicle.id}</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white text-base flex-shrink-0" style={{ backgroundColor: vehicle.ownerColor }}>{vehicle.ownerInitials}</div>
            <div><p className="font-semibold text-gray-900">{vehicle.owner}</p><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[vehicle.status]}`}>{vehicle.status}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Vehicle", value: `${vehicle.year} ${vehicle.make} ${vehicle.model}` },
              { label: "Plate Number", value: vehicle.plateNumber },
              { label: "Color", value: vehicle.color },
              { label: "Registered", value: vehicle.registered },
              { label: "Last Used", value: vehicle.lastUsed ?? "Never" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{item.label}</p><p className="font-semibold text-gray-900 text-sm">{item.value}</p></div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Documents</p>
            <div className="space-y-2">
              {vehicle.documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <span className="text-sm text-gray-700">📄 {doc.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doc.verified ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{doc.verified ? "✓ Verified" : "✕ Missing"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          {vehicle.status !== "verified" && (
            <button onClick={() => { onStatusChange(vehicle.id, "verified"); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">✓ Verify</button>
          )}
          {vehicle.status !== "rejected" && (
            <button onClick={() => { onStatusChange(vehicle.id, "rejected"); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">✕ Reject</button>
          )}
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Vehicle Modal ────────────────────────────────────────────────────────

function AddVehicleModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: Omit<Vehicle, "id" | "status" | "documents">) => void }) {
  const [form, setForm] = useState({ owner: "", ownerInitials: "", year: "", make: "", model: "", plateNumber: "", color: "", registered: new Date().toISOString().split("T")[0], lastUsed: null as string | null });
  const up = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div><h2 className="font-semibold text-gray-900">Add Vehicle</h2><p className="text-xs text-gray-400 mt-0.5">Register a new passenger vehicle</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "Passenger Owner *", key: "owner", placeholder: "Full name" },
            { label: "Year *", key: "year", placeholder: "e.g. 2020" },
            { label: "Make *", key: "make", placeholder: "e.g. Toyota" },
            { label: "Model *", key: "model", placeholder: "e.g. Camry" },
            { label: "Plate Number *", key: "plateNumber", placeholder: "e.g. LAG-234-AB" },
            { label: "Color *", key: "color", placeholder: "e.g. Silver" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={(e) => up(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { if (form.owner && form.make && form.model) { onAdd({ owner: form.owner, ownerInitials: form.owner.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(), ownerColor: "#4F46E5", year: Number(form.year), make: form.make, model: form.model, plateNumber: form.plateNumber, color: form.color, registered: form.registered, lastUsed: null }); onClose(); } }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors">Add Vehicle</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserVehicle() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return vehicles;
    const q = search.toLowerCase();
    return vehicles.filter((v) => v.id.toLowerCase().includes(q) || v.owner.toLowerCase().includes(q) || v.plateNumber.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q));
  }, [vehicles, search]);

  function handleStatusChange(id: string, status: VehicleStatus) {
    setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, status } : v));
  }

  function handleAdd(data: Omit<Vehicle, "id" | "status" | "documents">) {
    setVehicles((prev) => [...prev, { ...data, id: `PV${String(prev.length + 1).padStart(3, "0")}`, status: "pending", documents: [{ name: "Registration", verified: false }, { name: "Insurance", verified: false }, { name: "Roadworthiness", verified: false }] }]);
  }

  const stats = {
    total: vehicles.length,
    verified: vehicles.filter((v) => v.status === "verified").length,
    pending: vehicles.filter((v) => v.status === "pending").length,
    mostCommon: [...vehicles].sort((a, b) => vehicles.filter((v) => v.make === b.make).length - vehicles.filter((v) => v.make === a.make).length)[0]?.make ?? "N/A",
  };

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">User's Vehicle (Passenger Vehicles)</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage passenger-owned vehicles used for hiring drivers</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Passenger Vehicles", value: stats.total },
            { label: "Verified Vehicles", value: stats.verified, color: "text-emerald-600" },
            { label: "Pending Verification", value: stats.pending, color: "text-amber-600" },
            { label: "Most Common Brand", value: stats.mostCommon },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color ?? "text-gray-900"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="border border-[#3894A3] rounded-2xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-[#3894A3] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" /></svg>
          <div>
            <p className="text-sm font-semibold text-[#3894A3]">Passenger Vehicle Management</p>
            <p className="text-sm text-[#2F414F] mt-0.5">These are vehicles owned by passengers who want to hire professional drivers through Feur. Ensure all vehicle documents (registration, insurance, roadworthiness) are verified before approval.</p>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700 shrink-0">All Passenger Vehicles</p>
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-gray-400" />
            </div>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-[7px] text-sm font-medium bg-[#3894A3] hover:bg-teal-700 text-white transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Vehicle
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">{["Vehicle ID", "Passenger Owner", "Vehicle Details", "Plate Number", "Color", "Registered", "Last Used", "Status", "Actions"].map((h) => (<th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>))}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No vehicles found</td></tr>
                  : filtered.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{v.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-xs flex-shrink-0" style={{ backgroundColor: v.ownerColor }}>{v.ownerInitials}</div>
                          <span className="font-medium text-gray-900 whitespace-nowrap">{v.owner}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" /></svg>
                          <span className="text-gray-700 whitespace-nowrap">{v.year} {v.make} {v.model}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">{v.plateNumber}</td>
                      <td className="px-4 py-3.5 text-gray-600">{v.color}</td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{v.registered}</td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{v.lastUsed ?? "Never"}</td>
                      <td className="px-4 py-3.5"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[v.status]}`}>{v.status}</span></td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => setSelectedVehicle(v)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.length === 0 ? <div className="px-4 py-12 text-center text-gray-400 text-sm">No vehicles found</div>
              : filtered.map((v) => (
                <div key={v.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-sm flex-shrink-0" style={{ backgroundColor: v.ownerColor }}>{v.ownerInitials}</div>
                      <div><p className="font-semibold text-gray-900 text-sm">{v.owner}</p><p className="text-xs text-gray-400">{v.id}</p></div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[v.status]}`}>{v.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Vehicle</p><p className="font-medium text-gray-900 text-xs">{v.year} {v.make} {v.model}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Plate</p><p className="font-medium text-gray-900 text-sm">{v.plateNumber}</p></div>
                  </div>
                  <button onClick={() => setSelectedVehicle(v)} className="text-xs text-[#3894A3] font-medium hover:underline flex items-center gap-1">
                    View Details <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {selectedVehicle && <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} onStatusChange={handleStatusChange} />}
      {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}