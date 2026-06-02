import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingSettings {
  baseFare: string;
  perKmRate: string;
  perMinuteRate: string;
  platformCommission: string;
}

interface GeographicSettings {
  activeCities: string[];
  defaultCountry: string;
  defaultCurrency: string;
  cityInput: string;
}

interface OperationalSettings {
  startTime: string;
  endTime: string;
  maxWaitTime: string;
  maxRideDistance: string;
}

interface DriverRequirements {
  minVehicleYear: string;
  requiredDocs: string[];
  minRating: string;
}

interface NotificationPrefs {
  email: Record<string, boolean>;
  sms: Record<string, boolean>;
}

interface CommunicationSettings {
  supportEmail: string;
  supportPhone: string;
  emergencyContact: string;
  businessHours: string;
}

// ─── Save Toast ───────────────────────────────────────────────────────────────

function SaveToast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      {message}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[#3894A3]">{icon}</span>
        <h2 className="font-semibold text-gray-900 text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {helper && <p className="text-xs text-gray-400 mt-1">{helper}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
    />
  );
}

function SaveButton({ onClick, label = "Save Settings" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-teal-700 text-white transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
      {label}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-[#3894A3]" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SiteSetting() {
  const [toast, setToast] = useState("");

  const [pricing, setPricing] = useState<PricingSettings>({ baseFare: "5.00", perKmRate: "2.50", perMinuteRate: "0.50", platformCommission: "15" });
  const [geo, setGeo] = useState<GeographicSettings>({ activeCities: ["Lagos", "Accra", "Abuja", "Kumasi", "Port Harcourt", "Lusaka", "Tema", "Kano", "Ibadan", "Cape Coast", "Nairobi", "Kampala"], defaultCountry: "Nigeria", defaultCurrency: "USD", cityInput: "" });
  const [ops, setOps] = useState<OperationalSettings>({ startTime: "06:00", endTime: "23:00", maxWaitTime: "15", maxRideDistance: "100" });
  const [driverReq, setDriverReq] = useState<DriverRequirements>({ minVehicleYear: "2015", requiredDocs: ["Driver's License", "Insurance Certificate", "Background Check", "Profile Photo"], minRating: "4.0" });
  const [notifs, setNotifs] = useState<NotificationPrefs>({
    email: { "New driver registrations": true, "High-value transactions": true, "System errors": true, "Daily reports": false, "Support ticket updates": true },
    sms: { "Urgent support tickets": true, "System downtime": true, "Security alerts": true, "Payment failures": true, "Driver violations": false },
  });
  const [comms, setComms] = useState<CommunicationSettings>({ supportEmail: "support@feur.com", supportPhone: "+234 800 FEUR HELP", emergencyContact: "+234 911", businessHours: "Mon-Sat, 8AM-8PM" });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function removeCity(city: string) { setGeo((g) => ({ ...g, activeCities: g.activeCities.filter((c) => c !== city) })); }
  function addCity() {
    const v = geo.cityInput.trim();
    if (!v || geo.activeCities.includes(v)) return;
    setGeo((g) => ({ ...g, activeCities: [...g.activeCities, v], cityInput: "" }));
  }

  function toggleNotif(type: "email" | "sms", key: string) {
    setNotifs((n) => ({ ...n, [type]: { ...n[type], [key]: !n[type][key] } }));
  }

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure platform-wide settings and preferences</p>
        </div>

        <div className="space-y-5">

          {/* ── Pricing ── */}
          <Section icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} title="Pricing Configuration">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <Field label="Base Fare ($)" helper="Minimum fare charged per ride">
                <Input value={pricing.baseFare} onChange={(v) => setPricing((p) => ({ ...p, baseFare: v }))} placeholder="5.00" />
              </Field>
              <Field label="Per Kilometer Rate ($)" helper="Rate per kilometer traveled">
                <Input value={pricing.perKmRate} onChange={(v) => setPricing((p) => ({ ...p, perKmRate: v }))} placeholder="2.50" />
              </Field>
              <Field label="Per Minute Rate ($)" helper="Rate per minute of ride time">
                <Input value={pricing.perMinuteRate} onChange={(v) => setPricing((p) => ({ ...p, perMinuteRate: v }))} placeholder="0.50" />
              </Field>
              <Field label="Platform Commission (%)" helper="Feur's commission per ride">
                <Input value={pricing.platformCommission} onChange={(v) => setPricing((p) => ({ ...p, platformCommission: v }))} placeholder="15" />
              </Field>
            </div>
            <SaveButton onClick={() => showToast("Pricing settings saved!")} label="Save Pricing Settings" />
          </Section>

          {/* ── Service Areas ── */}
          <Section icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} title="Service Areas">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Active Cities</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {geo.activeCities.map((city) => (
                  <span key={city} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 text-sm rounded-lg font-medium">
                    {city}
                    <button onClick={() => removeCity(city)} className="text-teal-400 hover:text-teal-700 ml-0.5 text-base leading-none">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={geo.cityInput}
                  onChange={(e) => setGeo((g) => ({ ...g, cityInput: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addCity()}
                  placeholder="Add new city..."
                  className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
                <button onClick={addCity} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] text-white hover:bg-teal-700 transition-colors">Add</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <Field label="Default Country">
                <Input value={geo.defaultCountry} onChange={(v) => setGeo((g) => ({ ...g, defaultCountry: v }))} placeholder="Nigeria" />
              </Field>
              <Field label="Default Currency">
                <Input value={geo.defaultCurrency} onChange={(v) => setGeo((g) => ({ ...g, defaultCurrency: v }))} placeholder="USD" />
              </Field>
            </div>
            <SaveButton onClick={() => showToast("Geographic settings saved!")} label="Save Geographic Settings" />
          </Section>

          {/* ── Operational Hours ── */}
          <Section icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} title="Operational Hours">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <Field label="Service Start Time">
                <Input type="time" value={ops.startTime} onChange={(v) => setOps((o) => ({ ...o, startTime: v }))} />
              </Field>
              <Field label="Service End Time">
                <Input type="time" value={ops.endTime} onChange={(v) => setOps((o) => ({ ...o, endTime: v }))} />
              </Field>
              <Field label="Maximum Wait Time (minutes)" helper="Auto-cancel if driver doesn't arrive">
                <Input value={ops.maxWaitTime} onChange={(v) => setOps((o) => ({ ...o, maxWaitTime: v }))} placeholder="15" />
              </Field>
              <Field label="Maximum Ride Distance (km)" helper="Maximum distance for a single ride">
                <Input value={ops.maxRideDistance} onChange={(v) => setOps((o) => ({ ...o, maxRideDistance: v }))} placeholder="100" />
              </Field>
            </div>
            <SaveButton onClick={() => showToast("Operational settings saved!")} label="Save Operational Settings" />
          </Section>

          {/* ── Driver Requirements ── */}
          <Section icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" /></svg>} title="Driver Requirements">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Minimum Vehicle Year" helper="Vehicles older than this year are not accepted">
                <Input value={driverReq.minVehicleYear} onChange={(v) => setDriverReq((d) => ({ ...d, minVehicleYear: v }))} placeholder="2015" />
              </Field>
              <Field label="Minimum Driver Rating" helper="Drivers below this rating will be flagged">
                <Input value={driverReq.minRating} onChange={(v) => setDriverReq((d) => ({ ...d, minRating: v }))} placeholder="4.0" />
              </Field>
            </div>
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Required Documents</p>
              <div className="space-y-2">
                {driverReq.requiredDocs.map((doc) => (
                  <div key={doc} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {doc}
                    </span>
                    <button onClick={() => setDriverReq((d) => ({ ...d, requiredDocs: d.requiredDocs.filter((x) => x !== doc) }))} className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                  </div>
                ))}
              </div>
            </div>
            <SaveButton onClick={() => showToast("Driver requirements saved!")} label="Save Settings" />
          </Section>

          {/* ── Notification Preferences ── */}
          <Section icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} title="Notification Preferences">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Email Notifications</p>
                <div className="space-y-3">
                  {Object.entries(notifs.email).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <span className="text-sm text-gray-700">{key}</span>
                      <Toggle checked={val} onChange={() => toggleNotif("email", key)} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">SMS Alerts</p>
                <div className="space-y-3">
                  {Object.entries(notifs.sms).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <span className="text-sm text-gray-700">{key}</span>
                      <Toggle checked={val} onChange={() => toggleNotif("sms", key)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SaveButton onClick={() => showToast("Notification settings saved!")} label="Save Notification Settings" />
          </Section>

          {/* ── Communication Settings ── */}
          <Section icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} title="Communication Settings">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <Field label="Support Email">
                <Input type="email" value={comms.supportEmail} onChange={(v) => setComms((c) => ({ ...c, supportEmail: v }))} placeholder="support@feur.com" />
              </Field>
              <Field label="Support Phone">
                <Input value={comms.supportPhone} onChange={(v) => setComms((c) => ({ ...c, supportPhone: v }))} placeholder="+234 800 FEUR HELP" />
              </Field>
              <Field label="Emergency Contact">
                <Input value={comms.emergencyContact} onChange={(v) => setComms((c) => ({ ...c, emergencyContact: v }))} placeholder="+234 911" />
              </Field>
              <Field label="Business Hours">
                <Input value={comms.businessHours} onChange={(v) => setComms((c) => ({ ...c, businessHours: v }))} placeholder="Mon-Sat, 8AM-8PM" />
              </Field>
            </div>
            <SaveButton onClick={() => showToast("Communication settings saved!")} label="Save Communication Settings" />
          </Section>

        </div>
      </div>

      {toast && <SaveToast message={toast} />}
    </div>
  );
}