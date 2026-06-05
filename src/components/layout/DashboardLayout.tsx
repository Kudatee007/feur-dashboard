import { Outlet } from "react-router-dom";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "./AppSidebar";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Fixed topbar */}
          <div className="border-b border-[#C7DAD4] py-4 px-2 flex items-center shrink-0">
            <SidebarTrigger />
            <Navbar />
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
