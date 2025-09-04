"use client";

import { usePathname } from "next/navigation";
import MainLayout from "./MainLayout";
import WorkerLayout from "./WorkerLayout";

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ Match only actual worker routes (exact /worker or anything under /worker/)
  // ✅ Match only /publicpages/worker or anything under it
  const isWorkerRoute =
    pathname === "/worker" ||
    pathname.startsWith("/worker/") ||
    pathname === "/publicpages/worker" ||
    pathname.startsWith("/publicpages/worker/");

  return isWorkerRoute ? (
    <WorkerLayout>{children}</WorkerLayout>
  ) : (
    <MainLayout>{children}</MainLayout>
  );
}
