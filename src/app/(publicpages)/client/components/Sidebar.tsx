"use client";

import { useState } from "react";
import { MdDashboard } from "react-icons/md";
import {
  FaBriefcase,
  FaListAlt,
  FaBell,
  FaWallet,
  FaCog,
  FaTimes,
  FaBars,
  FaTools,
  FaHome, // 1. Import Home Icon
  FaArrowLeft
} from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Notification {
  id: number;
  message: string;
  seen: boolean;
  date: string;
}

interface SidebarProps {
  notifications?: Notification[];
}

export default function Sidebar({ notifications = [] }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.seen).length;

  const menu = [
    { key: "dashboard", label: "Dashboard", icon: <MdDashboard size={22} />, path: "/client/clientdashboard" },
    { key: "requests", label: "Requests", icon: <FaListAlt size={20} />, path: "/client/requests" },
    { key: "notifications", label: "Notifications", icon: <FaBell size={20} />, path: "/client/clientdashboard/notifications", count: unreadCount },
    { key: "payments", label: "Payments", icon: <FaWallet size={20} />, path: "/client/clientdashboard/payments" },
    { key: "settings", label: "Settings", icon: <FaCog size={20} />, path: "/client/settings" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white z-50 px-4 py-3 flex items-center justify-between shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
           <FaTools /> QuickFix
        </div>
        <button onClick={() => setIsOpen(true)} className="text-gray-700 p-2 hover:bg-slate-100 rounded-lg">
          <FaBars size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 shadow-xl md:shadow-none
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
            <Link href="/" className="flex items-center gap-2 text-blue-600 font-black text-2xl tracking-tight hover:opacity-80 transition">
              <FaTools /> QuickFix
            </Link>
            <button onClick={() => setIsOpen(false)} className="md:hidden ml-auto text-slate-400 hover:text-slate-600">
              <FaTimes size={20} />
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {menu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.key}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <span className={`transition-colors ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>

                {item.key === "notifications" && item.count && item.count > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Separator */}
          <div className="my-4 border-t border-slate-100 mx-2"></div>

          {/* 2. BACK TO HOME LINK */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all duration-200"
          >
            <FaArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </nav>

        {/* Sidebar Footer (Docs) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white text-center relative overflow-hidden shadow-lg shadow-blue-200">
              <div className="relative z-10">
                <p className="font-bold text-sm mb-1">Need Help?</p>
                <p className="text-xs text-blue-100 mb-3 opacity-90">Contact support or check docs</p>
                <button className="bg-white text-blue-600 text-xs font-bold px-4 py-2 rounded-lg w-full hover:bg-blue-50 transition active:scale-95">
                  View Docs
                </button>
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            </div>
        </div>
      </aside>
    </>
  );
}