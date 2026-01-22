"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bell, X, Menu, LayoutDashboard, FileText, 
  MessageSquare, Star, Settings, ChevronDown, LogOut 
} from "lucide-react";
import { FaTools, FaUserCircle } from "react-icons/fa";
import { useNotificationStore, useAuthStore } from "@/store/authStore";
import axios from "axios";
import { API_URL } from "@/lib/constants";
import { toast } from "sonner";

// Define the Worker Profile Interface
interface WorkerProfileData {
  _id: string;
  name: string;
  email: string;
  profilePic?: string; // The specific worker profile pic
  profession?: string;
  userId?: {
    name?: string;
    email?: string;
    profilePic?: string;
  }
}

export default function WorkerNavbar() {
  const count = useNotificationStore((state) => state.count);
  const { user, token, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfileData | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/worker/dashboard/jobposts", label: "Posts", icon: FileText },
    { href: "/worker/reviews", label: "Reviews", icon: Star },
    { href: "/worker/messages", label: "Messages", icon: MessageSquare },
    { href: "/worker/settings", label: "Settings", icon: Settings },
  ];

  // --- 1. Fetch Worker Profile on Mount ---
  useEffect(() => {
    const fetchWorkerData = async () => {
      if (user && token && user.role === 'worker') {
        try {
          // Fetch from your worker profile endpoint
          const { data } = await axios.get(`${API_URL}/worker/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWorkerProfile(data); // Assuming backend returns the profile object directly
        } catch (error) {
          console.error("Worker profile fetch error:", error);
        }
      }
    };
    fetchWorkerData();
  }, [user, token]);

  // --- 2. Robust Image Renderer ---
  const renderProfilePic = (size: 'sm' | 'lg' = 'sm') => {
    // Check all possible locations for the image
    const picUrl = 
      workerProfile?.profilePic || 
      workerProfile?.userId?.profilePic || 
      user?.profilePic || 
      (user as any)?.profile?.profilePic;

    const sizeClasses = size === 'sm' ? "w-10 h-10" : "w-14 h-14";

    if (picUrl) {
      return (
        <img
          src={picUrl}
          alt={user?.name || "Worker"}
          className={`${sizeClasses} rounded-full object-cover border border-slate-200 shadow-sm`}
        />
      );
    }
    return <FaUserCircle className={`${sizeClasses} text-slate-400`} />;
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, profileDropdownOpen]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

  return (
    <nav className="w-full flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 sticky z-40 top-0">
      {/* Left Section: Logo + Hamburger */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="w-6 h-6 text-slate-700" />
        </button>

        <Link href="/worker/dashboard" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <FaTools className="text-white text-lg" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-800">
            QuickFix<span className="text-blue-600">.</span>
          </span>
        </Link>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Link 
            href="/worker/notifications" 
            className="p-2 hover:bg-slate-100 rounded-full block transition-colors relative"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {count > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                {count}
              </span>
            )}
          </Link>
        </div>
        
        {/* DESKTOP PROFILE DROPDOWN (Replaces WorkerCard) */}
        <div className="hidden md:block relative" ref={dropdownRef}>
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-slate-50 rounded-full transition-all border border-transparent hover:border-slate-100"
          >
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-slate-700 leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-1">Professional</p>
            </div>
            {renderProfilePic('sm')}
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                 {renderProfilePic('lg')}
                 <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                 </div>
              </div>
              <div className="p-2">
                <Link href="/worker/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                   <FaUserCircle className="text-lg" /> Profile
                </Link>
                <Link href="/worker/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                   <Settings className="w-5 h-5" /> Settings
                </Link>
                <div className="my-1 border-t border-slate-50"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                   <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden" onClick={() => setMenuOpen(false)}>
          <div
            ref={menuRef}
            className="absolute top-0 left-0 w-72 h-full bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <span className="font-black text-xl text-slate-800">Navigation</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* MOBILE PROFILE CARD (Replaces WorkerCard) */}
            <div className="p-6 bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                {renderProfilePic('lg')}
                <div>
                   <p className="font-bold text-slate-800">{user?.name}</p>
                   <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <Link href="/worker/profile" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                View Profile
              </Link>
            </div>

            {/* Links */}
            <div className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-slate-100 my-2"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}