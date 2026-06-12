import { Outlet } from "react-router-dom";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "./AppSidebar";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />

        <div className="flex flex-1 flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#C7DAD4] bg-white px-4 py-4 shrink-0">
            <SidebarTrigger />
            <Navbar />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}