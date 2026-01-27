"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("client" | "worker" | "admin")[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { user, token, hydrate } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. Wait for the store to load the user from localStorage
    const checkAuth = async () => {
      await hydrate(); // Ensure store is ready
      setIsChecking(false);
    };
    checkAuth();
  }, [hydrate]);

  // 2. Redirect Logic
  useEffect(() => {
    if (!isChecking) {
      // Case A: Not Logged In
      if (!token || !user) {
        router.replace("/auth/login");
      } 
      // Case B: Logged In but Wrong Role
      else if (!allowedRoles.includes(user.role)) {
        // Redirect them to their CORRECT dashboard
        if (user.role === "client") router.replace("/client/dashboard");
        else if (user.role === "worker") router.replace("/worker/dashboard");
        else router.replace("/");
      }
    }
  }, [isChecking, user, token, router, allowedRoles]);

  // 3. Show Loading Screen while checking
  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  // 4. If Check Failed (and useEffect hasn't redirected yet), hide content
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  // 5. Access Granted
  return <>{children}</>;
}