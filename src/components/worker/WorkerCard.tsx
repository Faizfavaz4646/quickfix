"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Profile } from "@/types/user";
import { getWorkerProfile } from "@/services/workerService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Settings, User, LogOut } from "lucide-react";
import { API_URL } from "@/lib/constants";

const WorkerCard = () => {
  // Pull hasHydrated from your updated store
  const { user, logout, hasHydrated } = useAuthStore();
  const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    /**
     * STRICT GUARD:
     * 1. Wait until Zustand has finished reading from localStorage (hasHydrated)
     * 2. Ensure user._id is a real value (not "undefined" string)
     */
    const userId = user?._id;
    const canFetch = hasHydrated && userId && String(userId) !== "undefined";

    if (!canFetch) {
      return; 
    }

    const loadData = async () => {
      try {
        // Fetch profile using the hydrated ID
        const data = await getWorkerProfile(String(userId)); 
        setWorkerProfile(data);
      } catch (err) {
        console.error("WorkerCard: Profile fetch failed:", err);
      }
    };

    loadData();
  }, [hasHydrated, user?._id]); // Re-run when hydration finishes or user ID changes

 

  // Handle clicking outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // If the store hasn't hydrated or user isn't logged in, don't show the card
  if (!hasHydrated || !user) return null;
  // HELPER: Ensure URL is absolute
  const getFullImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
    toast.success("Signed out successfully.");
  };

  /**
   * IMAGE PRIORITY:
   * 1. Database (workerProfile.profilePic)
   * 2. Store fallback (user.profilePic)
   * 3. Default asset fallback
   */
const rawImage = workerProfile?.profilePic || user?.profilePic;
  const profileImage = getFullImageUrl(rawImage) || "/images/avatar.avif";

  return (
    <div className="relative">
      {/* Profile Trigger */}
      <button 
        onClick={() => setOpen(!open)}
        className="focus:outline-none block transition-transform active:scale-95"
      >
       <img
          src={profileImage}
          alt="Profile"
          className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md hover:border-blue-200 transition-all bg-slate-200"
          onError={(e) => {
            // Prevent infinite loop if default avatar is also missing
            const target = e.currentTarget;
            if (target.src.includes("avatar.avif")) return;
            target.src = "/images/avatar.avif";
          }}
        />
      </button>

      {/* Dropdown Modal */}
      {open && (
        <div 
          ref={modalRef} 
          className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl z-50 py-3 border border-slate-100 animate-in fade-in zoom-in duration-150"
        >
          {/* User Profile Header */}
          <div className="px-4 pb-3 border-b border-slate-50 flex items-center gap-3">
            <div className="relative">
              <img
                src={profileImage}
                alt="User"
                className="w-10 h-10 rounded-full border object-cover"
                onError={(e) => { e.currentTarget.src = "/images/avatar.avif"; }}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-slate-800 text-sm truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {user.email}
              </span>
            </div>
          </div>

          {/* Menu Options */}
          <div className="p-2 space-y-1">
            <button
              onClick={() => { setOpen(false); router.push("/worker/loggedinprofile_worker"); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
            >
              <User size={18} />
              Profile
            </button>
            <button
              onClick={() => { setOpen(false); router.push("/worker/settings"); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
            >
              <Settings size={18} />
              Settings
            </button>
          </div>

          {/* Sign Out Section */}
          <div className="border-t border-slate-50 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerCard;