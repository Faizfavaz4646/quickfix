// 


"use client";

import { useEffect, useState, ReactNode } from "react";
import SplashScreen from "@/components/ui/SplashScreen";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type MainLayoutProps = {
  children: ReactNode;
  splash?: boolean; // show splash for public pages only
};

export default function MainLayout({ children, splash = false }: MainLayoutProps) {
  const [loading, setLoading] = useState(splash);

  useEffect(() => {
    if (splash) {
      const t = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(t);
    }
  }, [splash]);

  if (loading) return <SplashScreen />;

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
