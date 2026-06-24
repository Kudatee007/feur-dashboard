import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  MapPinned,
  Car,
  CarFront,
  FileBarChart,
  FileText,
  Star,
  Plane,
  Bell,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const sidebarSections = [
  {
    header: "MAIN",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: "/",
      },
    ],
  },

  {
    header: "USERS & TRACKING",
    items: [
      {
        title: "Track Users",
        icon: MapPinned,
        url: "/track-users",
      },
    ],
  },

  {
    header: "RIDES & BOOKINGS",
    items: [
      {
        title: "Rides",
        icon: Car,
        url: "/rides",
      },
      // {
      //   title: "Manual Ride Booking",
      //   icon: CreditCard,
      //   url: "/manual-booking",
      // },
    ],
  },

  {
    header: "VEHICLES",
    items: [
      {
        title: "Vehicle Type",
        icon: CarFront,
        url: "/vehicle-types",
      },
      {
        title: "User's Vehicle",
        icon: Car,
        url: "/user-vehicles",
      },
      {
        title: "Earning Reports",
        icon: FileBarChart,
        url: "/earning-reports",
      },
    ],
  },

  {
    header: "FINANCIAL",
    items: [
      {
        title: "Manage Documents",
        icon: FileText,
        url: "/manage-documents",
      },
      {
        title: "Statement",
        icon: FileBarChart,
        url: "/statements",
      },
    ],
  },

  {
    header: "MANAGEMENT",
    items: [
      {
        title: "Reviews & Ratings",
        icon: Star,
        url: "/review-ratings",
      },
      {
        title: "Aerial View",
        icon: Plane,
        url: "/aerial-view",
      },
    ],
  },

  {
    header: "SETTINGS",
    items: [
      {
        title: "Push Notification",
        icon: Bell,
        url: "/notifications",
      },
      {
        title: "Site Setting",
        icon: Settings,
        url: "/site-settings",
      },
    ],
  },

  // {
  //   header: "SETTINGS",
  //   items: [
  //     {
  //       title: "Localization",
  //       icon: Globe,
  //       url: "/localization",
  //     },
  //     {
  //       title: "Pages",
  //       icon: FileText,
  //       url: "/pages",
  //     },
  //   ],
  // },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-white">
        {sidebarSections.map((section) => (
          <SidebarGroup key={section.header} className="p-4">
            <SidebarGroupLabel className="text-[#2F414F] text-xs font-semibold leading-4 pb-3">
              {section.header}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url}>
                      {({ isActive }) => (
                        <SidebarMenuButton
                          asChild
                          className={`h-11 px-3 ${
                            isActive
                              ? "bg-[#3894A3] text-white font-medium hover:bg-[#3894A3]"
                              : "hover:bg-transparent text-[#000000]"
                          }`}
                        >
                          <span className="flex items-center w-full">
                            <item.icon
                              className={
                                isActive ? "text-white" : "text-[#000000]"
                              }
                            />
                            <span
                              className={`text-base leading-6 p-2 ${
                                isActive
                                  ? "text-white"
                                  : "text-[#000000] font-normal"
                              }`}
                            >
                              {item.title}
                            </span>
                          </span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
