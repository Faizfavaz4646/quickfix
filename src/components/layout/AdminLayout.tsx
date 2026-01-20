"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardHeader from "@/components/admin/DashboardHeader";
import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLogin } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user && !isLogin) {
      router.replace("/login");
    } else if (user && user.role !== "admin") {
      router.replace("/not-found"); // Client-safe redirect
    } else if (user?.role === "admin") {
      setChecked(true);
    }
  }, [user, isLogin, hydrated, router]);

  if (!checked || !hydrated) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      <div className="w-full lg:w-64 flex-shrink-0 z-[70]">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="w-full bg-white shadow sticky top-0 z-50">
          <DashboardHeader />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
