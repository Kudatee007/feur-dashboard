const Navbar = () => {
  return (
    <div className="flex items-center justify-between w-full px-4">
      <div className="flex items-center gap-2">
        <div className="bg-[#3894A3] rounded-[10px] w-10 h-10 flex justify-center items-center">
          <span className="text-white text-base font-semibold leading-6">
            F
          </span>
        </div>
        <div>
          <span className="text-[#111111] text-xl leading-7 font-semibold">
            Feur Admin
          </span>
          <p className="text-xs leading-4 text-[#2F414F]">
            Comprehensive Platform Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-[#F0FDF4] text-sm leading-5 font-medium text-[#111111] dark:bg-green-950 dark:text-green-300 px-3 py-2 rounded-[10px]">
          <div className="">
            <span className="bg-[#00C950] w-1 h-1"></span>
            <span>284 Active Rides</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <span className="text-[#111111] text-sm leading-5 font-medium">
              Admin User
            </span>
            <p className="text-xs leading-4 text-[#2F414F]">admin@feur.com</p>
          </div>
          <div className="bg-[#3894A3] rounded-full w-10 h-10 flex justify-center items-center">
            <span className="text-white text-base font-semibold leading-6">
              AU
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
