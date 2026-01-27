"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomeRedirect() {
  const router = useRouter();
  const { user, isLogin, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && isLogin && user) {
      if (user.role === "worker") {
        router.replace("/worker/dashboard");
      } else if (user.role === "admin") {
        router.replace("/admin/dashboard");
      }
      // Clients stay on Home (or redirect to /client/dashboard if you prefer)
    }
  }, [hasHydrated, isLogin, user, router]);

  return null; // 👈 This component is invisible
}