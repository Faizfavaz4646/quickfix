"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SplashScreen from "@/components/ui/SplashScreen"
import Navbar from '@/components/layout/Navbar';
import { Toaster } from "sonner";
import Footer from "@/components/layout/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Pages where Navbar & Footer should be hidden
  const hideNavbarAndFooter = ["/publicpages/auth/login", "/publicpages/auth/signup", "/publicpages/worker/dashboard"];

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      {!hideNavbarAndFooter.includes(pathname) && <Navbar />}
      <Toaster richColors position="top-right" />
      {children}
      {!hideNavbarAndFooter.includes(pathname) && <Footer />}
    </>
  );
}
