import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VehicleType {
  id: string;
  name: string;
  description: string;
  minYear: number;
  suitableFor: string[];
  examples: string[];
  registeredVehicles: number;
  active: boolean;
}

interface FormData {
  name: string;
  description: string;
  minYear: string;
  suitableFor: string[];
  suitableInput: string;
  examples: string[];
  exampleInput: string;
  active: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_TYPES: VehicleType[] = [
  { id: "vt1", name: "Sedan", description: "Standard 4-door passenger cars", minYear: 2015, suitableFor: ["Daily commute", "Business trips", "Airport transfers"], examples: ["Toyota Camry", "Honda Accord", "Nissan Altima"], registeredVehicles: 1243, active: true },
  { id: "vt2", name: "SUV", description: "Sport Utility Vehicles for more space and comfort", minYear: 2016, suitableFor: ["Family trips", "Long distance", "Group travel"], examples: ["Toyota RAV4", "Honda CR-V", "Ford Explorer"], registeredVehicles: 892, active: true },
  { id: "vt3", name: "Luxury", description: "Premium and luxury vehicles", minYear: 2018, suitableFor: ["VIP services", "Special occasions", "Executive travel"], examples: ["Mercedes-Benz E-Class", "BMW 5 Series", "Lexus ES"], registeredVehicles: 287, active: true },
  { id: "vt4", name: "Compact", description: "Small and fuel-efficient cars", minYear: 2014, suitableFor: ["City driving", "Short trips", "Budget travel"], examples: ["Toyota Yaris", "Honda Fit", "Hyundai i20"], registeredVehicles: 456, active: true },
  { id: "vt5", name: "Minivan", description: "Spacious vans for large groups", minYear: 2015, suitableFor: ["Group travel", "Family trips", "Airport transfers"], examples: ["Toyota Sienna", "Honda Odyssey", "Chrysler Pacifica"], registeredVehicles: 214, active: false },
];

const EMPTY_FORM: FormData = { name: "", description: "", minYear: "2015", suitableFor: [], suitableInput: "", examples: [], exampleInput: "", active: true };

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

function VehicleTypeModal({ editing, onClose, onSave }: { editing: VehicleType | null; onClose: () => void; onSave: (data: FormData) => void }) {
  const [form, setForm] = useState<FormData>(
    editing
      ? { name: editing.name, description: editing.description, minYear: String(editing.minYear), suitableFor: [...editing.suitableFor], suitableInput: "", examples: [...editing.examples], exampleInput: "", active: editing.active }
      : EMPTY_FORM
  );

  function addTag(field: "suitableFor" | "examples", inputKey: "suitableInput" | "exampleInput") {
    const val = form[inputKey].trim();
    if (!val) return;
    setForm((f) => ({ ...f, [field]: [...f[field], val], [inputKey]: "" }));
  }

  function removeTag(field: "suitableFor" | "examples", idx: number) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-base">{editing ? "Edit Vehicle Type" : "Add Vehicle Type"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{editing ? "Update this vehicle category" : "Create a new vehicle category for passenger vehicles"}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Type Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g., Sedan, SUV, Luxury" className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe this vehicle type" rows={3} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Year</label>
            <input type="number" value={form.minYear} onChange={(e) => setForm((f) => ({ ...f, minYear: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
            <p className="text-xs text-gray-400 mt-1">Minimum vehicle manufacture year allowed for this type</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Suitable For <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-400 mb-2">Add use cases where this vehicle type is ideal</p>
            <div className="flex gap-2">
              <input value={form.suitableInput} onChange={(e) => setForm((f) => ({ ...f, suitableInput: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("suitableFor", "suitableInput"))} placeholder="e.g., Daily commute, Business trips" className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
              <button onClick={() => addTag("suitableFor", "suitableInput")} className="w-9 h-9 bg-[#3894A3] text-white rounded-xl flex items-center justify-center hover:bg-teal-700 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            {form.suitableFor.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.suitableFor.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs rounded-lg font-medium">
                    {s}
                    <button onClick={() => removeTag("suitableFor", i)} className="text-teal-400 hover:text-teal-700 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Examples <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-400 mb-2">Add example vehicle models that fit this type</p>
            <div className="flex gap-2">
              <input value={form.exampleInput} onChange={(e) => setForm((f) => ({ ...f, exampleInput: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("examples", "exampleInput"))} placeholder="e.g., Toyota Camry, Honda Accord" className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
              <button onClick={() => addTag("examples", "exampleInput")} className="w-9 h-9 bg-[#3894A3] text-white rounded-xl flex items-center justify-center hover:bg-teal-700 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            {form.examples.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.examples.map((ex, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                    {ex}
                    <button onClick={() => removeTag("examples", i)} className="text-gray-400 hover:text-gray-600 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-400 mt-0.5">This vehicle type will be available for passengers to select</p>
              </div>
              <button onClick={() => setForm((f) => ({ ...f, active: !f.active }))} className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? "bg-[#3894A3]" : "bg-gray-300"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { if (form.name && form.description) { onSave(form); onClose(); } }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors">
            {editing ? "Save Changes" : "Create Vehicle Type"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VehicleType() {
  const [types, setTypes] = useState<VehicleType[]>(INITIAL_TYPES);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VehicleType | null>(null);

  function handleSave(form: FormData) {
    if (editing) {
      setTypes((prev) => prev.map((t) => t.id === editing.id ? { ...t, name: form.name, description: form.description, minYear: Number(form.minYear), suitableFor: form.suitableFor, examples: form.examples, active: form.active } : t));
    } else {
      setTypes((prev) => [...prev, { id: `vt${Date.now()}`, name: form.name, description: form.description, minYear: Number(form.minYear), suitableFor: form.suitableFor, examples: form.examples, registeredVehicles: 0, active: form.active }]);
    }
    setEditing(null);
  }

  function handleDelete(id: string) { setTypes((prev) => prev.filter((t) => t.id !== id)); }
  function toggleActive(id: string) { setTypes((prev) => prev.map((t) => t.id === id ? { ...t, active: !t.active } : t)); }

  const stats = {
    total: types.length,
    active: types.filter((t) => t.active).length,
    totalVehicles: types.reduce((s, t) => s + t.registeredVehicles, 0),
    mostPopular: [...types].sort((a, b) => b.registeredVehicles - a.registeredVehicles)[0]?.name ?? "N/A",
  };

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Vehicle Types (Passenger Vehicles)</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage accepted vehicle categories from passengers</p>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-teal-700 text-white transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Vehicle Type
          </button>
        </div>

        {/* Info banner */}
        <div className="border border-[#3894A3] rounded-2xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-[#3894A3] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" /></svg>
          <div>
            <p className="text-base font-semibold text-[#3894A3]">About Vehicle Types</p>
            <p className="text-sm text-[#2F414F] mt-0.5">These categories define what types of passenger-owned vehicles are accepted on the Feur platform. Passengers register their own vehicles, and professional drivers are hired to drive them.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Categories", value: stats.total },
            { label: "Active Categories", value: stats.active },
            { label: "Total Vehicles", value: stats.totalVehicles.toLocaleString() },
            { label: "Most Popular", value: stats.mostPopular },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Vehicle type cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map((vt) => (
            <div key={vt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3894A3] rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{vt.name}</p>
                      <p className="text-xs text-gray-400">{vt.description}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleActive(vt.id)} className={`px-2.5 py-0.5 rounded-[7px] text-xs font-medium transition-colors ${vt.active ? "bg-[#DCFCE7] border border-[#B9F8CF] text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {vt.active ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-[#F1F9FB] rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Requirements</p>
                    <p className="text-sm text-gray-700">Minimum Year: {vt.minYear}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Suitable For:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {vt.suitableFor.map((s) => (
                        <span key={s} className="px-2.5 py-0.5 bg-white border rounded-[7px] text-gray-600 text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Example Vehicles:</p>
                    <p className="text-sm text-gray-600">{vt.examples.join(", ")}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Registered Vehicles</p>
                    <p className="font-bold text-gray-900">{vt.registeredVehicles.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex border-t border-gray-100">
                <button onClick={() => { setEditing(vt); setShowModal(true); }} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
                <div className="w-px bg-gray-100" />
                <button onClick={() => handleDelete(vt.id)} className="px-5 py-3 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && <VehicleTypeModal editing={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}