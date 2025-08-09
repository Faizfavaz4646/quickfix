
"use client";

import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen"; 
import Navbar from "./Navbar";
import { Toaster } from "sonner";
import Footer from "./Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return <>
  <Navbar />
   <Toaster richColors position="top-right" />
  {children}
     <Footer />
  </>;
}
