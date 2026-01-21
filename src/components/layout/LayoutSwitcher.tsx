"use client";

import { usePathname } from "next/navigation";
import MainLayout from "./MainLayout";
import WorkerLayout from "./WorkerLayout";
import AdminLayout from "@/components/layout/AdminLayout";

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ Worker routes
  const isWorkerRoute =
    pathname === "/worker" ||
    pathname.startsWith("/worker/") ||
    pathname === "/publicpages/worker" ||
    pathname.startsWith("/publicpages/worker/");

  // ✅ Admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  // ✅ Client Dashboard routes (NEW FIX)
  // We identify these so we can skip the MainLayout
  const isClientDashboard = pathname.startsWith("/client");

  if (isWorkerRoute) {
    return <WorkerLayout>{children}</WorkerLayout>;
  }

  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // ✅ FIX: If on Client Dashboard, render children directly.
  // We do NOT want MainLayout (Global Nav/Footer) here.
  // The 'ClientDashboardLayout' file in your app directory will provide the Sidebar/Footer.
  if (isClientDashboard) {
    return <>{children}</>;
  }

  // ✅ Default = normal site (Home, Login, Signup, etc.)
  return <MainLayout>{children}</MainLayout>;
}