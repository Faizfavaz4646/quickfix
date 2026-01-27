import { useAuthStore } from "@/types/user";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import AdminSidebar from "../admin/AdminSidebar";
import DashboardHeader from "../admin/DashboardHeader";

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
      router.replace("/not-found");
    } else if (user?.role === "admin") {
      setChecked(true);
    }
  }, [user, isLogin, hydrated, router]);

  if (!checked || !hydrated) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/*  Sidebar - Fixed width matches w-72 used in AdminSidebar.tsx */}
      <AdminSidebar />

      {/*  Main Content Wrapper */}
      {/* lg:pl-72 ensures content starts AFTER the fixed sidebar on desktop */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        
        {/* Header - Sticky within the content wrapper */}
        <div className="sticky top-0 z-[60] w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
          <DashboardHeader />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}