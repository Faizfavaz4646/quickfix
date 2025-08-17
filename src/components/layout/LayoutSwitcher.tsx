"use client";

import { usePathname } from "next/navigation";
import MainLayout from "./MainLayout";
import WorkerLayout from "./WorkerLayout";

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkerRoute = pathname.startsWith("/worker") || pathname.startsWith("/publicpages/worker");;

  return isWorkerRoute ? (
    <WorkerLayout>{children}</WorkerLayout>
  ) : (
    <MainLayout>{children}</MainLayout>
  );
}
