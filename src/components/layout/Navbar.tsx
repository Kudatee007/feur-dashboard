// src/components/layout/Navbar.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/auth.store";
import { useActiveRides } from "../../features/rides/hooks/useRides";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initialsOf(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "AD";
}

function fullName(firstName?: string, lastName?: string) {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name || "Admin User";
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const admin = useAuthStore((s) => s.admin);
  const logout = useAuthStore((s) => s.logout);

  // Reuse your existing active rides hook — just grab the KPI total
  const { data: ridesData } = useActiveRides({
    page: 1,
    limit: 1, // we only need the kpi count, not the full table
  });

  const activeRidesCount = ridesData?.kpis?.totalActive ?? 0;
  const initials = initialsOf(admin?.firstName, admin?.lastName);
  const name = fullName(admin?.firstName, admin?.lastName);
  const email = admin?.email ?? "admin@feur.com";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between w-full px-4 py-2">
        {/* ── Left — Logo + Name ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-[#3894A3] rounded-[10px] w-10 h-10 flex justify-center items-center flex-shrink-0">
            <span className="text-white text-base font-semibold leading-6">
              F
            </span>
          </div>
          <div className="hidden sm:block min-w-0">
            <span className="text-[#111111] text-xl leading-7 font-semibold block truncate">
              Feur Admin
            </span>
            <p className="text-xs leading-4 text-[#2F414F] truncate">
              Comprehensive Platform Management
            </p>
          </div>
          <span className="sm:hidden text-[#111111] text-base font-semibold truncate">
            Feur Admin
          </span>
        </div>

        {/* ── Right — Desktop ────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Active rides badge */}
          <div className="bg-[#F0FDF4] text-sm leading-5 font-medium text-[#111111] px-3 py-2 rounded-[10px] flex items-center gap-1.5 flex-shrink-0">
            <span className="bg-[#00C950] w-2 h-2 rounded-full inline-block flex-shrink-0 animate-pulse" />
            <span>{activeRidesCount.toLocaleString()} Active Rides</span>
          </div>

          {/* Admin info + avatar — click to open dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown((v) => !v)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
            >
              <div className="text-right">
                <span className="text-[#111111] text-sm leading-5 font-medium block">
                  {name}
                </span>
                <p className="text-xs leading-4 text-[#2F414F]">{email}</p>
              </div>
              <div className="bg-[#3894A3] rounded-full w-10 h-10 flex justify-center items-center flex-shrink-0">
                <span className="text-white text-base font-semibold leading-6">
                  {initials}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Desktop dropdown */}
            {showDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                  {/* Profile section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{email}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      Admin
                    </span>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate("/site-settings");
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right — Mobile ─────────────────────────────────────────── */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Compact active rides */}
          <div className="sm:flex hidden items-center gap-1.5 bg-[#F0FDF4] px-2.5 py-1.5 rounded-[10px]">
            <span className="bg-[#00C950] w-2 h-2 rounded-full inline-block animate-pulse" />
            <span className="text-xs font-medium text-[#111111]">
              {activeRidesCount.toLocaleString()}
            </span>
          </div>

          {/* Avatar */}
          <div className="bg-[#3894A3] rounded-full w-9 h-9 flex justify-center items-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">{initials}</span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="md-hidden absolute right-0 top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-100 z-20 px-4 py-3 bg-white space-y-3">
          {/* Active rides */}
          <div className="flex items-center gap-2 bg-[#F0FDF4] px-3 py-2 rounded-[10px] w-full">
            <span className="bg-[#00C950] w-2 h-2 rounded-full inline-block flex-shrink-0 animate-pulse" />
            <span className="text-sm font-medium text-[#111111]">
              {activeRidesCount.toLocaleString()} Active Rides
            </span>
          </div>

          {/* Admin info */}
          <div className="flex items-center gap-3 px-1">
            <div className="bg-[#3894A3] rounded-full w-10 h-10 flex justify-center items-center flex-shrink-0">
              <span className="text-white text-base font-semibold">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111111] truncate">
                {name}
              </p>
              <p className="text-xs text-[#2F414F] truncate">{email}</p>
            </div>
          </div>

          {/* Mobile menu items */}
          <div className="border-t border-gray-100 pt-3 space-y-1">
            <button
              onClick={() => {
                navigate("/site-settings");
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
