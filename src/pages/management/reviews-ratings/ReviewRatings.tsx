import { useState, useMemo } from "react";

interface Review {
  id: string;
  passenger: string;
  passengerInitials: string;
  passengerColor: string;
  driver: string;
  rideId: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  flagged: boolean;
}

const REVIEWS: Review[] = [
  { id: "rv1", passenger: "Sarah Johnson", passengerInitials: "SJ", passengerColor: "#4F46E5", driver: "Michael Okonkwo", rideId: "RIDE2854", rating: 5, comment: "Excellent service! Very professional and courteous driver.", date: "2024-11-19", helpful: 12, flagged: false },
  { id: "rv2", passenger: "Amara Nwankwo", passengerInitials: "AN", passengerColor: "#059669", driver: "David Mensah", rideId: "RIDE2853", rating: 3, comment: "Good ride, but driver was a bit late.", date: "2024-11-19", helpful: 8, flagged: false },
  { id: "rv3", passenger: "Grace Osei", passengerInitials: "GO", passengerColor: "#7C3AED", driver: "Kofi Asante", rideId: "RIDE2851", rating: 5, comment: "Amazing! Very clean car and smooth ride.", date: "2024-11-19", helpful: 15, flagged: false },
  { id: "rv4", passenger: "Fatima Hassan", passengerInitials: "FH", passengerColor: "#0891B2", driver: "Ibrahim Yusuf", rideId: "RIDE2849", rating: 3, comment: "Average experience. Driver could be more friendly.", date: "2024-11-18", helpful: 5, flagged: false },
  { id: "rv5", passenger: "Daniel Opoku", passengerInitials: "DO", passengerColor: "#B45309", driver: "Emmanuel Banda", rideId: "RIDE2850", rating: 2, comment: "Driver took a longer route. Not happy with the service.", date: "2024-11-18", helpful: 3, flagged: true },
  { id: "rv6", passenger: "Blessing Adeyemi", passengerInitials: "BA", passengerColor: "#065F46", driver: "Tunde Bakare", rideId: "RIDE2848", rating: 5, comment: "Perfect ride! On time and very comfortable.", date: "2024-11-18", helpful: 9, flagged: false },
  { id: "rv7", passenger: "Peter Mwale", passengerInitials: "PM", passengerColor: "#BE185D", driver: "Emmanuel Banda", rideId: "RIDE2847", rating: 4, comment: "Good experience overall. Would recommend.", date: "2024-11-17", helpful: 6, flagged: false },
  { id: "rv8", passenger: "John Akpan", passengerInitials: "JA", passengerColor: "#DC2626", driver: "Chioma Eze", rideId: "RIDE2846", rating: 1, comment: "Terrible experience. Driver was rude and car was dirty.", date: "2024-11-17", helpful: 2, flagged: true },
];

type FilterType = "all" | "5" | "4" | "3" | "2" | "1" | "flagged";

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`${sz} ${i < rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function ReviewsRatings() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let data = reviews;
    if (filter === "flagged") data = data.filter((r) => r.flagged);
    else if (filter !== "all") data = data.filter((r) => r.rating === Number(filter));
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((r) => r.passenger.toLowerCase().includes(q) || r.driver.toLowerCase().includes(q) || r.rideId.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q));
    }
    return data;
  }, [reviews, filter, search]);

  function toggleHelpful(id: string) {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, helpful: r.helpful + 1 } : r));
  }
  function toggleFlag(id: string) {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, flagged: !r.flagged } : r));
  }
  function deleteReview(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const starCounts = [5, 4, 3, 2, 1].map((s) => ({ star: s, count: reviews.filter((r) => r.rating === s).length }));

  return (
    <div className="bg-gray-50 font-sans">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor customer feedback and driver ratings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Avg Rating</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">{avgRating} <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></p>
          </div>
          {starCounts.map((s) => (
            <div key={s.star} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400">{s.star} Star</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.count}</p>
            </div>
          ))}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{reviews.length}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by passenger, driver, ride ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-gray-400" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 flex-shrink-0">
            {(["all", "5", "4", "3", "2", "1", "flagged"] as FilterType[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors capitalize ${filter === f ? "bg-teal-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {f === "all" ? "All" : f === "flagged" ? "🚩 Flagged" : `${f} ★`}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Reviews</h2>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-gray-400 text-sm">No reviews found</div>
            ) : filtered.map((r) => (
              <div key={r.id} className={`p-5 ${r.flagged ? "bg-red-50/30" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-sm flex-shrink-0" style={{ backgroundColor: r.passengerColor }}>{r.passengerInitials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{r.passenger}</span>
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        <span className="text-sm text-gray-600">{r.driver}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{r.rideId}</span>
                        {r.flagged && <span className="text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">🚩 Flagged</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <Stars rating={r.rating} />
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => toggleHelpful(r.id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal-600 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                          Helpful ({r.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{r.date}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleFlag(r.id)} className={`p-1.5 rounded-lg transition-colors ${r.flagged ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`} title={r.flagged ? "Unflag" : "Flag"}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                      </button>
                      <button onClick={() => deleteReview(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}