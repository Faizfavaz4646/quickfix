"use client";

import { usePathname } from "next/navigation";
import MainLayout from "./MainLayout";
import WorkerLayout from "./WorkerLayout";
import AdminLayout from "@/app/admin/layout";


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

  if (isWorkerRoute) {
    return <WorkerLayout>{children}</WorkerLayout>;
  }

  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // ✅ Default = normal site
  return <MainLayout>{children}</MainLayout>;
}
