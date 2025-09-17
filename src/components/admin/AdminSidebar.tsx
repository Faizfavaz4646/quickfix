"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdDashboardCustomize,
  MdCategory,
  MdOutlineAnalytics,
} from "react-icons/md";
import { FaUsers, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import { BsFillClipboardDataFill } from "react-icons/bs";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", icon: <MdDashboardCustomize />, href: "/admin/dashboard" },
    { name: "Service Workers", icon: <FaUsers />, href: "/admin/service_workers" },
    { name: "Clients", icon: <FaUsers />, href: "/admin/clients" },
    { name: "Jobs & Requests", icon: <RiShoppingCartLine />, href: "/admin/jobs" },
    { name: "Service Categories", icon: <MdCategory />, href: "/admin/categories" },
    { name: "Locations", icon: <FaMapMarkerAlt />, href: "/admin/locations" },
    { name: "Analytics", icon: <MdOutlineAnalytics />, href: "/admin/analytics" },
    { name: "Revenue", icon: <FaMoneyBillWave />, href: "/admin/revenue" },
    { name: "Reports", icon: <BsFillClipboardDataFill />, href: "/admin/reports" },
    { name: "Settings", icon: <MdDashboardCustomize />, href: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white text-gray-800 border-r border-gray-200 z-20">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-center p-4 border-b border-gray-200">
            <span className="font-bold text-lg text-gray-900 whitespace-nowrap">
              QuickFix Admin
            </span>
          </div>

          {/* Links */}
          <nav className="mt-4 flex flex-col px-2 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="ml-3 whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 ml-64">
     {/* Admin main content goes here */}

      </div>
    </div>
  );
}
