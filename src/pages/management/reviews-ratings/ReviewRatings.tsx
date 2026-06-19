// src/features/reviews/pages/ReviewsRatings.tsx

import { useState, useEffect } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useReviews } from "../../../features/reviews/hooks/useReviews";

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#4F46E5", "#059669", "#DC2626", "#7C3AED",
  "#0891B2", "#B45309", "#BE185D", "#065F46",
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function relativeDate(dateStr: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Stars ────────────────────────────────────────────────────────────────

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

// ─── Skeletons ────────────────────────────────────────────────────────────

function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
      <div className="h-3 w-16 bg-gray-200 rounded mb-3" />
      <div className="h-7 w-12 bg-gray-200 rounded" />
    </div>
  );
}

function SkeletonReviewRow() {
  return (
    <div className="p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-48 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-3/4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Rating bar ───────────────────────────────────────────────────────────

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 w-8 shrink-0">{star} ★</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-400 w-4 shrink-0 text-right">{count}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

type StarFilter = "all" | "5" | "4" | "3" | "2" | "1";

export default function ReviewsRatings() {
  const [page, setPage] = useState(1);
  const [starFilter, setStarFilter] = useState<StarFilter>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  // Reset page when filters change
  useEffect(() => setPage(1), [starFilter, debouncedSearch]);

  const { data, isLoading, isError, refetch, isFetching } = useReviews({
    page,
    limit: PAGE_SIZE,
  });

  const kpis = data?.kpis;
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  // The API doesn't support star/search filtering — we filter client-side
  // within the current page. For a large dataset ask backend to add params.
  const reviews = (data?.reviews ?? []).filter((r) => {
    const matchesStar = starFilter === "all" || r.rating === Number(starFilter);
    const q = debouncedSearch.toLowerCase();
    const matchesSearch =
      !q ||
      r.passengerName.toLowerCase().includes(q) ||
      r.driverName.toLowerCase().includes(q) ||
      r.rideCode.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q);
    return matchesStar && matchesSearch;
  });

  const starsBreakdown = kpis?.starsBreakdown;
  const totalReviews = kpis?.totalReviews ?? 0;
  const avgRating = kpis?.averageRating?.toFixed(1) ?? "—";

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor customer feedback and driver ratings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
          {/* Avg Rating */}
          {isLoading ? (
            Array.from({ length: 7 }).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:col-span-2">
                <p className="text-xs text-gray-400 mb-2">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900">{avgRating}</p>
                  <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="mt-3 space-y-1.5">
                  {([5, 4, 3, 2, 1] as const).map((s) => (
                    <RatingBar
                      key={s}
                      star={s}
                      count={starsBreakdown?.[String(s) as keyof typeof starsBreakdown] ?? 0}
                      total={totalReviews}
                    />
                  ))}
                </div>
              </div>

              {/* Per-star cards */}
              {([5, 4, 3, 2, 1] as const).map((s) => (
                <div key={s} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs text-gray-400">{s} Star</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {starsBreakdown?.[String(s) as keyof typeof starsBreakdown] ?? 0}
                  </p>
                </div>
              ))}

              {/* Total Reviews */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalReviews.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by passenger, driver, ride ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 shrink-0">
            {(["all", "5", "4", "3", "2", "1"] as StarFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStarFilter(f)}
                className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${starFilter === f ? "bg-[#3894A3] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {f === "all" ? "All" : `${f} ★`}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Reviews</h2>
            {isFetching && !isLoading && (
              <span className="text-xs text-gray-400">Updating…</span>
            )}
          </div>

          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm font-medium text-gray-700">Failed to load reviews</p>
              <button onClick={() => refetch()} className="text-xs text-[#3894A3] font-medium hover:underline">
                Try again
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonReviewRow key={i} />)
              ) : reviews.length === 0 ? (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">
                  No reviews found
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.rideId} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-sm flex-shrink-0"
                          style={{ backgroundColor: colorFor(r.passengerName) }}
                        >
                          {initialsOf(r.passengerName)}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Names + ride code */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">{r.passengerName}</span>
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span className="text-sm text-gray-600">{r.driverName}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {r.rideCode}
                            </span>
                          </div>

                          {/* Stars */}
                          <div className="flex items-center gap-3 mt-1">
                            <Stars rating={r.rating} />
                            <span className="text-xs text-gray-400">{r.rating}/5</span>
                          </div>

                          {/* Comment */}
                          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{r.comment}</p>

                          {/* Helpful count */}
                          <div className="flex items-center gap-3 mt-3">
                            <span className="flex items-center gap-1.5 text-xs text-gray-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              {r.helpfulCount} found this helpful
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                        {relativeDate(r.date)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {!isError && pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total} reviews
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                    if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span key={`e-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n as number)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? "bg-[#3894A3] text-white" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        {n}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}