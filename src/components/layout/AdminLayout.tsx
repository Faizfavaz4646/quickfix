"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardHeader from "@/components/admin/DashboardHeader";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0 z-[70]">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="w-full bg-white shadow sticky top-0 z-50">
          <DashboardHeader />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
