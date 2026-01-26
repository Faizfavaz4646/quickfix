"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, Search, Bell, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    toast("Confirm Logout", {
      description: "Are you sure you want to end your session?",
      action: {
        label: "Logout",
        onClick: () => {
          logout();
          setIsMenuOpen(false);
          router.push("/auth/login");
          toast.success("Logged out successfully");
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-[70] bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between">
      
      {/* Left: Search Bar */}
      <div className="hidden md:flex relative w-full max-w-md group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Search for users, jobs, or reports..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:bg-white focus:border-indigo-600 transition-all"
        />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3 ml-auto">
        
        {/* Notifications */}
        <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-100 uppercase">
              {user?.name?.substring(0, 2) || "AD"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-slate-900 leading-none">{user?.name || "Admin"}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Super Admin</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/60 p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Account</p>
                <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{user?.email || "admin@quickfix.com"}</p>
              </div>

              <div className="space-y-1">
                <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                  <User size={18} className="text-slate-400" />
                  My Profile
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                  <Settings size={18} className="text-slate-400" />
                  Account Settings
                </button>
                <div className="h-[1px] bg-slate-50 my-1 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}