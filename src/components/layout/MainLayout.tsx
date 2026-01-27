"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SplashScreen from "@/components/ui/SplashScreen";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // 1. Define Exact Paths to Hide
  const hideOnExactPaths = [
    "/auth/login",
    "/auth/signup",
  ];

  // 2. LOGIC: Hide if it's an Auth page OR a Video Call page
  // We use .startsWith("/call") to catch ALL video rooms
  const shouldHide = 
    hideOnExactPaths.includes(pathname) || 
    pathname?.startsWith("/call");

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      {/* 3. Use the new variable here */}
      {!shouldHide && <Navbar />}
      
      {children}

      {/* 4. And here */}
      {!shouldHide && <Footer />}
    </>
  );
}