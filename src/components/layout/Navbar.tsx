import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full px-4 py-2">
        {/* Left — Logo + Name */}
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
          {/* Mobile: just show name, no subtitle */}
          <span className="sm:hidden text-[#111111] text-base font-semibold truncate">
            Feur Admin
          </span>
        </div>

        {/* Right — Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Active Rides Badge */}
          <div className="bg-[#F0FDF4] text-sm leading-5 font-medium text-[#111111] px-3 py-2 rounded-[10px] flex items-center gap-1.5 flex-shrink-0">
            <span className="bg-[#00C950] w-2 h-2 rounded-full inline-block flex-shrink-0" />
            <span>284 Active Rides</span>
          </div>

          {/* Admin info + avatar */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[#111111] text-sm leading-5 font-medium block">
                Admin User
              </span>
              <p className="text-xs leading-4 text-[#2F414F]">admin@feur.com</p>
            </div>
            <div className="bg-[#3894A3] rounded-full w-10 h-10 flex justify-center items-center flex-shrink-0">
              <span className="text-white text-base font-semibold leading-6">
                AU
              </span>
            </div>
          </div>
        </div>

        {/* Right — Mobile: avatar + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {/* Compact active rides */}
          <div className="sm:flex hidden items-center gap-1.5 bg-[#F0FDF4] px-2.5 py-1.5 rounded-[10px]">
            <span className="bg-[#00C950] w-2 h-2 rounded-full inline-block" />
            <span className="text-xs font-medium text-[#111111]">284</span>
          </div>

          {/* Avatar */}
          <div className="bg-[#3894A3] rounded-full w-9 h-9 flex justify-center items-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">AU</span>
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

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 bg-white space-y-3">
          {/* Active rides */}
          <div className="flex items-center gap-2 bg-[#F0FDF4] px-3 py-2 rounded-[10px] w-full">
            <span className="bg-[#00C950] w-2 h-2 rounded-full inline-block flex-shrink-0" />
            <span className="text-sm font-medium text-[#111111]">
              284 Active Rides
            </span>
          </div>

          {/* Admin info row */}
          <div className="flex items-center gap-3 px-1">
            <div className="bg-[#3894A3] rounded-full w-10 h-10 flex justify-center items-center flex-shrink-0">
              <span className="text-white text-base font-semibold">AU</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#111111]">Admin User</p>
              <p className="text-xs text-[#2F414F]">admin@feur.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
