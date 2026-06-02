import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  translationPercent: number;
  enabled: boolean;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  active: boolean;
}

interface RegionalSettings {
  defaultLanguage: string;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_LANGUAGES: Language[] = [
  { id: "l1", code: "EN", name: "English", nativeName: "English", translationPercent: 100, enabled: true },
  { id: "l2", code: "FR", name: "French", nativeName: "Français", translationPercent: 95, enabled: true },
  { id: "l3", code: "SW", name: "Swahili", nativeName: "Kiswahili", translationPercent: 90, enabled: true },
  { id: "l4", code: "YO", name: "Yoruba", nativeName: "Yorùbá", translationPercent: 85, enabled: true },
  { id: "l5", code: "IG", name: "Igbo", nativeName: "Igbo", translationPercent: 60, enabled: false },
  { id: "l6", code: "HA", name: "Hausa", nativeName: "Hausa", translationPercent: 55, enabled: false },
];

const INITIAL_CURRENCIES: Currency[] = [
  { id: "c1", code: "NGN", name: "Nigerian Naira", symbol: "₦", active: true },
  { id: "c2", code: "USD", name: "US Dollar", symbol: "$", active: true },
  { id: "c3", code: "GHS", name: "Ghanaian Cedi", symbol: "₵", active: true },
  { id: "c4", code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", active: true },
  { id: "c5", code: "KES", name: "Kenyan Shilling", symbol: "KSh", active: true },
];

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"];
const TIME_FORMATS = ["24-hour", "12-hour"];
// const LANGUAGES_LIST = ["English", "French", "Swahili", "Yoruba", "Igbo", "Hausa"];
// const CURRENCY_CODES = ["NGN", "USD", "GHS", "ZMW", "KES", "XOF", "EUR"];

// ─── Save Toast ───────────────────────────────────────────────────────────────

function SaveToast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      {message}
    </div>
  );
}

// ─── Add Language Modal ───────────────────────────────────────────────────────

function AddLanguageModal({ onClose, onAdd }: { onClose: () => void; onAdd: (lang: Omit<Language, "id">) => void }) {
  const [form, setForm] = useState({ code: "", name: "", nativeName: "", translationPercent: "0", enabled: false });
  const up = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div><h2 className="font-semibold text-gray-900">Add Language</h2><p className="text-xs text-gray-400 mt-0.5">Add a new language to the platform</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "Language Code (e.g. EN)", key: "code", placeholder: "EN" },
            { label: "Language Name", key: "name", placeholder: "English" },
            { label: "Native Name", key: "nativeName", placeholder: "English" },
            { label: "Translation % (0-100)", key: "translationPercent", placeholder: "0" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={(e) => up(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
            </div>
          ))}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Enable immediately</span>
            <button onClick={() => up("enabled", !form.enabled)} className={`relative w-10 h-5 rounded-full transition-colors ${form.enabled ? "bg-[3894A3]" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { if (form.code && form.name) { onAdd({ code: form.code.toUpperCase(), name: form.name, nativeName: form.nativeName || form.name, translationPercent: Number(form.translationPercent) || 0, enabled: form.enabled }); onClose(); } }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors">Add Language</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Currency Modal ───────────────────────────────────────────────────────

function AddCurrencyModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Omit<Currency, "id">) => void }) {
  const [form, setForm] = useState({ code: "", name: "", symbol: "", active: true });
  const up = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div><h2 className="font-semibold text-gray-900">Add Currency</h2><p className="text-xs text-gray-400 mt-0.5">Add a supported currency</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "Currency Code", key: "code", placeholder: "USD" },
            { label: "Currency Name", key: "name", placeholder: "US Dollar" },
            { label: "Symbol", key: "symbol", placeholder: "$" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={(e) => up(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (form.code && form.name && form.symbol) { onAdd({ code: form.code.toUpperCase(), name: form.name, symbol: form.symbol, active: form.active }); onClose(); } }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors">Add Currency</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Localization() {
  const [languages, setLanguages] = useState<Language[]>(INITIAL_LANGUAGES);
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [regional, setRegional] = useState<RegionalSettings>({ defaultLanguage: "English", defaultCurrency: "NGN", dateFormat: "DD/MM/YYYY", timeFormat: "24-hour" });
  const [showAddLang, setShowAddLang] = useState(false);
  const [showAddCurr, setShowAddCurr] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function toggleLanguage(id: string) { setLanguages((prev) => prev.map((l) => l.id === id ? { ...l, enabled: !l.enabled } : l)); }
  function removeLanguage(id: string) { setLanguages((prev) => prev.filter((l) => l.id !== id)); }
  function addLanguage(lang: Omit<Language, "id">) { setLanguages((prev) => [...prev, { ...lang, id: `l${Date.now()}` }]); }

  function toggleCurrency(id: string) { setCurrencies((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c)); }
  function removeCurrency(id: string) { setCurrencies((prev) => prev.filter((c) => c.id !== id)); }
  function addCurrency(curr: Omit<Currency, "id">) { setCurrencies((prev) => [...prev, { ...curr, id: `c${Date.now()}` }]); }

  const upRegional = (k: keyof RegionalSettings, v: string) => setRegional((r) => ({ ...r, [k]: v }));

  function progressColor(p: number) {
    if (p >= 90) return "bg-emerald-500";
    if (p >= 70) return "bg-teal-500";
    if (p >= 50) return "bg-amber-500";
    return "bg-red-400";
  }

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Localization Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage languages, currencies, and regional settings</p>
        </div>

        <div className="space-y-5">

          {/* ── Languages ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#3894A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h2 className="font-semibold text-gray-900">Languages</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{languages.length}</span>
              </div>
              <button onClick={() => setShowAddLang(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-teal-700 text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Language
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 bg-[#3894A3] rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">{lang.code}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{lang.name}</p>
                      <p className="text-xs text-gray-400">{lang.nativeName}</p>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 max-w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progressColor(lang.translationPercent)}`} style={{ width: `${lang.translationPercent}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">Translations {lang.translationPercent}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${lang.enabled ? "text-emerald-700 bg-emerald-50" : "text-gray-500 bg-gray-100"}`}>
                      {lang.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <button onClick={() => toggleLanguage(lang.id)} className={`relative w-10 h-5 rounded-full transition-colors ${lang.enabled ? "bg-[#3894A3]" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${!lang.enabled ? "translate-x-1" : "translate-x-0.5"}`} />
                    </button>
                    <button onClick={() => removeLanguage(lang.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Currencies ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#3894A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h2 className="font-semibold text-gray-900">Supported Currencies</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{currencies.length}</span>
              </div>
              <button onClick={() => setShowAddCurr(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Currency
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0">
              {currencies.map((curr, idx) => (
                <div key={curr.id} className={`flex items-center justify-between px-5 py-4 ${idx % 2 === 0 && idx < currencies.length - 1 ? "sm:border-r sm:border-gray-50" : ""} border-b border-gray-50`}>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{curr.code} – {curr.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Symbol: {curr.symbol}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleCurrency(curr.id)} className={`px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${curr.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {curr.active ? "Active" : "Inactive"}
                    </button>
                    <button onClick={() => removeCurrency(curr.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Regional Settings ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-5 h-5 text-[#3894A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <h2 className="font-semibold text-gray-900">Regional Settings</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Language</label>
                <select value={regional.defaultLanguage} onChange={(e) => upRegional("defaultLanguage", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white">
                  {languages.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Currency</label>
                <select value={regional.defaultCurrency} onChange={(e) => upRegional("defaultCurrency", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white">
                  {currencies.map((c) => <option key={c.id} value={c.code}>{c.code} – {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Format</label>
                <select value={regional.dateFormat} onChange={(e) => upRegional("dateFormat", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white">
                  {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Format</label>
                <select value={regional.timeFormat} onChange={(e) => upRegional("timeFormat", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white">
                  {TIME_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <button onClick={() => showToast("Regional settings saved!")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              Save Regional Settings
            </button>
          </div>

        </div>
      </div>

      {showAddLang && <AddLanguageModal onClose={() => setShowAddLang(false)} onAdd={addLanguage} />}
      {showAddCurr && <AddCurrencyModal onClose={() => setShowAddCurr(false)} onAdd={addCurrency} />}
      {toast && <SaveToast message={toast} />}
    </div>
  );
}