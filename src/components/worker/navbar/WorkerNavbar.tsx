"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bell, X, Menu, LayoutDashboard, FileText, 
  MessageSquare, Star, Settings, ChevronDown, LogOut, User 
} from "lucide-react";
import { FaTools, FaUserCircle } from "react-icons/fa";
import { useNotificationStore, useAuthStore } from "@/store/authStore";
import { getMyWorkerProfile } from "@/services/workerService";
import { API_URL } from "@/lib/constants"; 
import { toast } from "sonner";

// ✅ 1. Import the shared Profile type
import { Profile } from "@/types/user";
import NotificationBell from "@/components/NotificationBell";

export default function WorkerNavbar() {
  const count = useNotificationStore((state) => state.count);
  const { user, logout, hasHydrated } = useAuthStore();
  
  // Cast state to 'any' to access token safely
  const token = (user as any)?.token || (useAuthStore.getState() as any).token;

  const pathname = usePathname();
  const router = useRouter();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // ✅ 2. Use the imported Profile type here
  const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/worker/dashboard/jobposts", label: "Posts", icon: FileText },
    { href: "/worker/reviews", label: "Reviews", icon: Star },
    { href: "/worker/messages", label: "Messages", icon: MessageSquare },
    { href: "/worker/settings", label: "Settings", icon: Settings },
  ];

  // --- 1. Fetch Worker Profile ---
  useEffect(() => {
    if (!hasHydrated || !user || !token) return;

    const fetchProfile = async () => {
      try {
        const data = await getMyWorkerProfile(token);
        if (data) setWorkerProfile(data);
      } catch (error) {
        console.error("Navbar profile fetch error:", error);
      }
    };
    fetchProfile();
  }, [hasHydrated, user, token]);

  // --- 2. IMAGE URL FIXER ---
  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("https") || path.startsWith("data:")) return path;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${API_URL}/${cleanPath}`; 
  };

  // --- 3. Render Helper ---
  const renderProfilePic = (size: 'sm' | 'lg' = 'sm') => {
    // Priority: Worker Profile -> User ID Nested -> User Store
    // Note: We cast to 'any' for nested properties just in case 'Profile' type definition 
    // in your types file is strict and doesn't explicitly declare the populated 'userId' object.
    const rawPic = 
      workerProfile?.profilePic || 
      (workerProfile as any)?.userId?.profilePic || 
      user?.profilePic;

    const finalUrl = getImageUrl(rawPic);

    let sizeClasses = "w-9 h-9";
    if (size === 'lg') sizeClasses = "w-12 h-12";

    if (finalUrl) {
      return (
        <img
          src={finalUrl}
          alt={user?.name || "Worker"}
          className={`${sizeClasses} rounded-full object-cover border border-slate-200 shadow-sm bg-gray-100`}
          onError={(e) => {
             e.currentTarget.src = "/images/avatar.avif"; 
          }}
        />
      );
    }
    return <FaUserCircle className={`${sizeClasses} text-slate-300`} />;
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

  // Lock body scroll
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

  if (!hasHydrated) return null;

  // Safe access to profession
  const profession = workerProfile?.profession || "Worker";

  return (
    <>
      <nav className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky z-40 top-0 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* --- LEFT: Logo & Mobile Toggle --- */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/worker/dashboard" className="flex items-center gap-2 group">
                <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-6 transition-transform shadow-sm">
                  <FaTools className="text-white text-lg" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">
                  QuickFix<span className="text-blue-600">.</span>
                </span>
                <span className="font-bold text-lg tracking-tight text-slate-800 sm:hidden">
                  QuickFix
                </span>
              </Link>
            </div>

            {/* --- CENTER: Desktop Navigation --- */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100/50" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* --- RIGHT: Profile & Actions --- */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              <NotificationBell />
              
              <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>

              {/* Desktop Profile Dropdown */}
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                >
                  {renderProfilePic('sm')}
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-700 leading-none max-w-[100px] truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                      {profession}
                    </p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 ml-1 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-4">
                      {renderProfilePic('lg')}
                      <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                            {profession}
                          </span>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link href="/worker/loggedinprofile_worker" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <User size={18} /> Profile
                      </Link>
                      <Link href="/worker/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <Settings size={18} /> Settings
                      </Link>
                      <div className="my-1 border-t border-slate-100"></div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE SIDE MENU --- */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <div
        ref={menuRef}
        className={`fixed top-0 left-0 w-[300px] h-full bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
           <Link href="/worker/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <FaTools className="text-white text-base" />
              </div>
              <span className="font-bold text-lg text-slate-800">QuickFix.</span>
           </Link>
           <button onClick={() => setMenuOpen(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
             {renderProfilePic('lg')}
             <div className="overflow-hidden">
                <p className="font-bold text-slate-800 text-sm truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                    {profession}
                </p>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link 
              href="/worker/loggedinprofile_worker" 
              onClick={() => setMenuOpen(false)}
              className="flex justify-center items-center gap-2 py-2.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
               <User size={14} /> Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="flex justify-center items-center gap-2 py-2.5 rounded-lg bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
               <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}