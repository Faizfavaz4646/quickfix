"use client";

import { usePathname } from "next/navigation";
import MainLayout from "./MainLayout";
import WorkerLayout from "./WorkerLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import RoleGuard from "@/components/auth/RoleGuard"; // 1. IMPORT ROLEGUARD

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  //  Worker routes
  const isWorkerRoute =
    pathname === "/worker" ||
    pathname.startsWith("/worker/") ||
    pathname === "/publicpages/worker" ||
    pathname.startsWith("/publicpages/worker/");

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  // Client Dashboard routes
  const isClientDashboard = pathname.startsWith("/client");

  // --- 1. PROTECT WORKER ROUTES ---
  if (isWorkerRoute) {
    return (
      <RoleGuard allowedRoles={["worker"]}>
        <WorkerLayout>{children}</WorkerLayout>
      </RoleGuard>
    );
  }

  // --- 2. PROTECT ADMIN ROUTES ---
  if (isAdminRoute) {
    return (
      <RoleGuard allowedRoles={["admin"]}>
        <AdminLayout>{children}</AdminLayout>
      </RoleGuard>
    );
  }

  // --- 3. PROTECT CLIENT ROUTES (Here is where you asked) ---
  if (isClientDashboard) {
    return (
      <RoleGuard allowedRoles={["client"]}>
        {/* We render children directly because src/app/client/layout.tsx likely handles the sidebar */}
        {children}
      </RoleGuard>
    );
  }

  //  Default = normal site (Home, Login, Signup, etc.)
  // No RoleGuard needed here (Public Pages)
  return <MainLayout>{children}</MainLayout>;
}