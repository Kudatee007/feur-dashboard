import { useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  audience: string;
  sentAt: string;
  delivered: number;
  opened: number;
  status: "sent" | "scheduled" | "draft";
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "PN001",
    title: "New Feature Alert",
    message: "Check out our new in-app chat feature!",
    audience: "All Users",
    sentAt: "2024-11-19 10:00",
    delivered: 12847,
    opened: 8234,
    status: "sent",
  },
  {
    id: "PN002",
    title: "Weekend Bonus",
    message: "Earn 20% more this weekend! Drive more, earn more.",
    audience: "Drivers",
    sentAt: "2024-11-18 08:00",
    delivered: 1204,
    opened: 876,
    status: "sent",
  },
  {
    id: "PN003",
    title: "Safety Reminder",
    message: "Please always verify passenger identity before starting rides.",
    audience: "Drivers",
    sentAt: "2024-11-17 09:00",
    delivered: 1204,
    opened: 654,
    status: "sent",
  },
  {
    id: "PN004",
    title: "Holiday Promo",
    message: "Get 15% off all rides this holiday season!",
    audience: "Passengers",
    sentAt: "2024-11-20 12:00",
    delivered: 0,
    opened: 0,
    status: "scheduled",
  },
  {
    id: "PN005",
    title: "App Update Available",
    message: "Update your app for better experience.",
    audience: "All Users",
    sentAt: "",
    delivered: 0,
    opened: 0,
    status: "draft",
  },
  {
    id: "PN006",
    title: "Rate Your Ride",
    message: "Don't forget to rate your last ride experience!",
    audience: "Passengers",
    sentAt: "2024-11-16 14:00",
    delivered: 8420,
    opened: 5231,
    status: "sent",
  },
];

const AUDIENCE_OPTIONS = [
  "All Users",
  "Passengers",
  "Drivers",
  "Active Passengers",
  "Active Drivers",
  "Inactive Users",
];

const STATUS_STYLES = {
  sent: "bg-emerald-50 text-emerald-700",
  scheduled: "bg-amber-50 text-amber-700",
  draft: "bg-gray-100 text-gray-500",
};

export default function PushNotification() {
  const [notifications, setNotifications] =
    useState<Notification[]>(NOTIFICATIONS);
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "",
    schedule: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const up = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleSend() {
    if (!form.title || !form.message) return;
    setSending(true);
    setTimeout(() => {
      const newNotif: Notification = {
        id: `PN${String(notifications.length + 1).padStart(3, "0")}`,
        title: form.title,
        message: form.message,
        audience: form.audience || "All Users",
        sentAt:
          form.schedule ||
          new Date().toISOString().slice(0, 16).replace("T", " "),
        delivered: form.schedule ? 0 : Math.floor(Math.random() * 10000) + 1000,
        opened: 0,
        status: form.schedule ? "scheduled" : "sent",
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setForm({ title: "", message: "", audience: "", schedule: "" });
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }, 1200);
  }

  function deleteNotif(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const stats = {
    totalSent: notifications
      .filter((n) => n.status === "sent")
      .reduce((s, n) => s + n.delivered, 0),
    delivered: notifications
      .filter((n) => n.status === "sent")
      .reduce((s, n) => s + n.delivered, 0),
    opened: notifications
      .filter((n) => n.status === "sent")
      .reduce((s, n) => s + n.opened, 0),
    openRate: (() => {
      const d = notifications
        .filter((n) => n.status === "sent")
        .reduce((s, n) => s + n.delivered, 0);
      const o = notifications
        .filter((n) => n.status === "sent")
        .reduce((s, n) => s + n.opened, 0);
      return d > 0 ? ((o / d) * 100).toFixed(1) + "%" : "0%";
    })(),
  };

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Push Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Send notifications to users and drivers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Sent", value: stats.totalSent.toLocaleString() },
            {
              label: "Delivered",
              value: stats.delivered.toLocaleString(),
              color: "text-[#00A63E]",
            },
            {
              label: "Opened",
              value: stats.opened.toLocaleString(),
              color: "text-[#3894A3]",
            },
            { label: "Open Rate", value: stats.openRate },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <p className="text-xs text-gray-400">{s.label}</p>
              <p
                className={`text-2xl font-bold mt-1 ${s.color ?? "text-gray-900"}`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Compose */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-[#3894A3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h2 className="font-semibold text-gray-900">
              Send New Notification
            </h2>
          </div>

          {sent && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-700">
              <svg
                className="w-4 h-4 shrink-0"
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
              Notification sent successfully!
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notification Title
              </label>
              <input
                value={form.title}
                onChange={(e) => up("title", e.target.value)}
                placeholder="Enter notification title"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) => up("message", e.target.value)}
                placeholder="Enter your message..."
                rows={4}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={form.audience}
                  onChange={(e) => up("audience", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
                >
                  <option value="">Select audience...</option>
                  {AUDIENCE_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.schedule}
                  onChange={(e) => up("schedule", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to send immediately
                </p>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !form.title || !form.message}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              {sending ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Recent Notifications
            </h2>
          </div>
          <div className="">
            {notifications.map((n) => (
              <div key={n.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 bg-[#F1F9FB] py-4 px-1 border border-[#C7DAD4] rounded-[10px]">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 text-[#3894A3]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">
                          {n.title}
                        </span>
                        <div>
                          <span className="text-xs text-gray-400 font-mono">
                            {n.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[n.status]}`}
                          >
                            {n.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-[#2F414F] mt-0.5 truncate">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {n.audience}
                        </span>
                        {n.sentAt && (
                          <span className="text-xs text-gray-400">
                            {n.sentAt}
                          </span>
                        )}
                      </div>
                      {n.status === "sent" && (
                        <div className="flex items-start justify-between gap-2 mt-2">
                          <div className="flex flex-col items-start gap-0.3 bg-white p-2 w-full rounded-lg">
                            <span className="text-xs text-gray-500">
                              Delivered
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              {n.delivered.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col items-start gap-0.3 bg-white p-2 w-full rounded-lg">
                            <span className="text-xs text-gray-500">
                              Opened
                            </span>
                            <span className="text-xs font-semibold text-[#3894A3]">
                              {n.opened.toLocaleString()}
                            </span>
                          </div>
                          {/* <span className="text-xs text-gray-500">Rate <span className="font-semibold text-gray-900">{n.delivered > 0 ? ((n.opened / n.delivered) * 100).toFixed(1) : 0}%</span></span> */}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotif(n.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
