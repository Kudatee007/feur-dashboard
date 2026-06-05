import { Outlet } from "react-router-dom";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "./AppSidebar";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full overflow-hidden">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="border-b border-[#C7DAD4] py-4 px-2 flex items-center shrink-0 absolute top-0 left-0 right-0 bg-white z-10">
            <SidebarTrigger />
            <Navbar />
          </div>
          {/* Fixed topbar */}

          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
