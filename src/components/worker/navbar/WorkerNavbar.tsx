"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bell, X, Menu, LogOut, 
  LayoutDashboard, FileText, 
  MessageSquare, Star, Settings 
} from "lucide-react";
import WorkerCard from "@/components/worker/WorkerCard";
import { FaTools } from "react-icons/fa";
import { useNotificationStore } from "@/store/authStore";

export default function WorkerNavbar() {
  const count = useNotificationStore((state) => state.count);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/worker/dashboard/jobposts", label: "Posts", icon: FileText },
    { href: "/worker/reviews", label: "Reviews", icon: Star },
    { href: "/worker/messages", label: "Messages", icon: MessageSquare },
    { href: "/worker/settings", label: "Settings", icon: Settings },
  ];

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [menuOpen]);

  return (
    <>
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
        <div className="flex items-center gap-3">
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
          
          {/* DESKTOP CARD */}
          <div className="hidden md:block border-l pl-3 ml-1">
            <WorkerCard />
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

              {/* MOBILE CARD (Fixed: Removed Link Wrapper) */}
              <div className="p-6 bg-slate-50/50">
                <WorkerCard />
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
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}