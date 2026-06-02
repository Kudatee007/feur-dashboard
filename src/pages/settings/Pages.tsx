import { useState } from "react";

type PageStatus = "published" | "draft";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  lastUpdated: string;
  pageViews: number;
  content: string;
}

const INITIAL_PAGES: Page[] = [
  { id: "pg1", title: "About Us", slug: "/about", status: "published", lastUpdated: "2024-10-15", pageViews: 2340, content: "We are Feur, a comprehensive ride-hailing platform..." },
  { id: "pg2", title: "Privacy Policy", slug: "/privacy", status: "published", lastUpdated: "2024-09-20", pageViews: 5620, content: "Your privacy is important to us..." },
  { id: "pg3", title: "Terms of Service", slug: "/terms", status: "published", lastUpdated: "2024-09-20", pageViews: 4890, content: "By using our platform, you agree to these terms..." },
  { id: "pg4", title: "Contact Us", slug: "/contact", status: "published", lastUpdated: "2024-11-01", pageViews: 1560, content: "Get in touch with our support team..." },
  { id: "pg5", title: "FAQ", slug: "/faq", status: "published", lastUpdated: "2024-11-10", pageViews: 3240, content: "Frequently asked questions about Feur..." },
  { id: "pg6", title: "Safety Guidelines", slug: "/safety", status: "draft", lastUpdated: "2024-11-18", pageViews: 0, content: "Safety is our top priority..." },
];

interface PageModalProps {
  page: Page | null;
  onClose: () => void;
  onSave: (data: { title: string; slug: string; status: PageStatus; content: string }) => void;
}

function PageModal({ page, onClose, onSave }: PageModalProps) {
  const [form, setForm] = useState({
    title: page?.title ?? "",
    slug: page?.slug ?? "/",
    status: page?.status ?? "draft" as PageStatus,
    content: page?.content ?? "",
  });
  const up = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{page ? "Edit Page" : "Create New Page"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{page ? `Editing: ${page.title}` : "Add a new content page"}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Page Title *</label>
            <input value={form.title} onChange={(e) => { up("title", e.target.value); if (!page) up("slug", "/" + e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} placeholder="e.g., About Us" className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
            <input value={form.slug} onChange={(e) => up("slug", e.target.value)} placeholder="/about" className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <div className="flex gap-2">
              {(["published", "draft"] as PageStatus[]).map((s) => (
                <button key={s} onClick={() => up("status", s)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize border transition-colors ${form.status === s ? s === "published" ? "bg-emerald-500 text-white border-emerald-500" : "bg-amber-500 text-white border-amber-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Content *</label>
            <textarea value={form.content} onChange={(e) => up("content", e.target.value)} placeholder="Enter page content..." rows={8} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none" />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { if (form.title && form.slug && form.content) { onSave(form); onClose(); } }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors">{page ? "Save Changes" : "Create Page"}</button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ page, onClose }: { page: Page; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{page.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{page.slug}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${page.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{page.status}</span>
            <span className="text-xs text-gray-400">Last updated: {page.lastUpdated}</span>
            <span className="text-xs text-gray-400">{page.pageViews.toLocaleString()} views</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{page.content}</div>
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Close Preview</button>
        </div>
      </div>
    </div>
  );
}

export default function Pages() {
  const [pages, setPages] = useState<Page[]>(INITIAL_PAGES);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | PageStatus>("all");

  function handleSave(data: { title: string; slug: string; status: PageStatus; content: string }) {
    if (editingPage) {
      setPages((prev) => prev.map((p) => p.id === editingPage.id ? { ...p, ...data, lastUpdated: new Date().toISOString().split("T")[0] } : p));
    } else {
      setPages((prev) => [...prev, { id: `pg${Date.now()}`, ...data, lastUpdated: new Date().toISOString().split("T")[0], pageViews: 0 }]);
    }
    setEditingPage(null);
  }

  function deletePage(id: string) { setPages((prev) => prev.filter((p) => p.id !== id)); }
  function toggleStatus(id: string) { setPages((prev) => prev.map((p) => p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p)); }

  const filtered = filterStatus === "all" ? pages : pages.filter((p) => p.status === filterStatus);
  const stats = { total: pages.length, published: pages.filter((p) => p.status === "published").length, drafts: pages.filter((p) => p.status === "draft").length, totalViews: pages.reduce((s, p) => s + p.pageViews, 0) };

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pages Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage website content pages</p>
          </div>
          <button onClick={() => { setEditingPage(null); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create New Page
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Pages", value: stats.total },
            { label: "Published", value: stats.published, color: "text-emerald-600" },
            { label: "Drafts", value: stats.drafts, color: "text-amber-600" },
            { label: "Total Views", value: stats.totalViews.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color ?? "text-gray-900"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {(["all", "published", "draft"] as const).map((f) => (
            <button key={f} onClick={() => setFilterStatus(f)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${filterStatus === f ? "bg-[#3894A3] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{f}</button>
          ))}
        </div>

        {/* Pages grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((pg) => (
            <div key={pg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#3894A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{pg.title}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{pg.slug}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleStatus(pg.id)} className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize transition-colors cursor-pointer ${pg.status === "published" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                    {pg.status}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5">{pg.lastUpdated}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Page Views</p>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5">{pg.pageViews.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex border-t border-gray-100">
                <button onClick={() => { setEditingPage(pg); setShowCreate(true); }} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
                <div className="w-px bg-gray-100" />
                <button onClick={() => setPreviewPage(pg)} className="px-5 py-3 text-gray-400 hover:text-[#3894A3] hover:bg-teal-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <div className="w-px bg-gray-100" />
                <button onClick={() => deletePage(pg.id)} className="px-5 py-3 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreate && <PageModal page={editingPage} onClose={() => { setShowCreate(false); setEditingPage(null); }} onSave={handleSave} />}
      {previewPage && <PreviewModal page={previewPage} onClose={() => setPreviewPage(null)} />}
    </div>
  );
}