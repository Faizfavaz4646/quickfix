'use client';

import { toast } from 'sonner';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { FaTools, FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { RiAccountPinCircleFill } from "react-icons/ri";
import { IoMdSettings } from "react-icons/io";
import { MdOutlineRateReview, MdDashboardCustomize } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import { getClientProfile } from '@/services/clientService';
import axios from 'axios';
import { API_URL } from '@/lib/constants';

// ✅ IMPORT THE BELL
import NotificationBell from '@/components/NotificationBell';

interface ClientProfileData {
  _id: string;
  name?: string;
  email?: string;
  profilePic?: string; 
  userId?: {
    name?: string;
    email?: string;
    profilePic?: string;
  }
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [clientProfile, setClientProfile] = useState<ClientProfileData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  
  // ✅ FIX: Cast to 'any' to avoid TypeScript error if interface is missing 'token'
  const token = useAuthStore((state) => (state as any).token); 

  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const handleJoinProfessional = () => {
    if (!user) {
      router.push("/auth/signup?role=worker");
      return;
    }
    if (user.role === "client") {
      toast.error("You are registered as a client. Please logout to register as a worker.");
      return;
    }
    if (user.role === "worker") {
      toast("You are already registered as a professional.");
      return;
    }
  };

  const handleLogout = () => {
    toast("Are you sure you want to logout?", {
      action: {
        label: "Yes",
        onClick: async () => {
          try {
            await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
            logout();
            router.push("/auth/login");
            toast.success("Logged out successfully");
          } catch (err) {
            console.error("Logout failed", err);
            toast.error("Logout failed. Try again.");
          }
        },
      },
      cancel: { label: "No", onClick: () => toast.dismiss() },
      duration: 5000,
    });
  };

  // --- Effects ---
  useEffect(() => {
    setIsMounted(true);

    const fetchProfile = async () => {
      // We need both user and token to fetch data
      if (user && token && user.role === 'client') {
        try {
          const data = await getClientProfile(token);
          if (data && data.profile) {
             setClientProfile(data.profile);
          }
        } catch (error) {
          console.error("Failed to load navbar profile", error);
        }
      }
    };

    fetchProfile();
  }, [user, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // --- Render Helpers ---

  const renderProfilePic = (size: 'sm' | 'lg' = 'sm') => {
    const picUrl = 
      clientProfile?.profilePic ||           
      clientProfile?.userId?.profilePic ||   
      user?.profilePic ||                    
      (user as any)?.profile?.profilePic;    

    const sizeClasses = size === 'sm' ? "w-9 h-9" : "w-14 h-14";

    if (picUrl) {
      return (
        <img
          src={picUrl}
          alt={user?.name || "User"}
          className={`${sizeClasses} rounded-full object-cover border border-gray-200 shadow-sm`}
        />
      );
    }

    return <FaUserCircle className={`${sizeClasses} text-gray-400`} />;
  };

  if (!isMounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
            <FaTools className="text-white text-lg" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            QuickFix
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/about" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link>
          <Link href="/services" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Services</Link>
          <Link href="/client/findworker" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Find Professionals</Link>
          
          <button onClick={handleJoinProfessional} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Join as Pro
          </button>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

          {user ? (
            // ✅ GROUPED BELL AND PROFILE
            <div className="flex items-center gap-4">
              
              {/* 🔔 1. Notification Bell */}
              <NotificationBell />

              {/* 👤 2. Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200"
                >
                  {renderProfilePic('sm')}
                  <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                      {renderProfilePic('lg')}
                      <div className="overflow-hidden">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {user?.role || "User"}
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      <MenuItem icon={<RiAccountPinCircleFill size={20} />} label="Your Profile" onClick={() => router.push("/client/loggedin_profile")} />
                      <MenuItem icon={<MdDashboardCustomize size={20} />} label="Dashboard" onClick={() => router.push("/client/clientdashboard")} />
                      <MenuItem icon={<MdOutlineRateReview size={20} />} label="My Requests" onClick={() => router.push("/client/previous-requests")} />
                      <MenuItem icon={<IoMdSettings size={20} />} label="Settings" onClick={() => router.push("/client/settings")} />
                      <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>
                      <button onClick={() => { handleLogout(); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <FaSignOutAlt size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/auth/login" className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 transition-colors">Login</Link>
              <Link href="/auth/signup" className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
           {/* Mobile Bell */}
           {user && <NotificationBell />} 
           <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col p-4 space-y-1">
            <MobileLink href="/about" onClick={() => setIsOpen(false)}>About</MobileLink>
            <MobileLink href="/services" onClick={() => setIsOpen(false)}>Services</MobileLink>
            <MobileLink href="/client/findworker" onClick={() => setIsOpen(false)}>Find Professionals</MobileLink>
            <button onClick={() => { handleJoinProfessional(); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">Join as Professional</button>
            <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    {renderProfilePic('sm')}
                    <div><p className="font-semibold text-sm">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div>
                  </div>
                  <MobileLink href="/client/loggedin_profile" onClick={() => setIsOpen(false)}>Profile</MobileLink>
                  <MobileLink href="/client/clientdashboard" onClick={() => setIsOpen(false)}>Dashboard</MobileLink>
                  <MobileLink href="/client/previous-requests" onClick={() => setIsOpen(false)}>Requests</MobileLink>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <Link href="/auth/login" onClick={() => setIsOpen(false)} className="w-full text-center py-2.5 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Login</Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="w-full text-center py-2.5 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-all group"><span className="text-gray-400 group-hover:text-blue-600 transition-colors">{icon}</span>{label}</button>;
}

function MobileLink({ href, onClick, children }: { href: string, onClick: () => void, children: React.ReactNode }) {
  return <Link href={href} onClick={onClick} className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">{children}</Link>;
}