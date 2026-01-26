"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { 
  LayoutDashboard, Users, Briefcase, Tags, MapPin, 
  BarChart3, ShieldAlert, Settings, LogOut, Menu, X, CheckCircle2
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Grouped Navigation for better UX
  const menuGroups = [
    {
      group: "Overview",
      items: [
        { name: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/admin" },
        { name: "Analytics", icon: <BarChart3 size={18} />, href: "/admin/analytics" },
      ],
    },
    {
      group: "Management",
      items: [
        { name: "Users", icon: <Users size={18} />, href: "/admin/service_workers" },
        { name: "Jobs & Requests", icon: <Briefcase size={18} />, href: "/admin/jobs" },
        { name: "Post Moderation", icon: <ShieldAlert size={18} />, href: "/admin/posts" },
      ],
    },
    {
      group: "System Config",
      items: [
        { name: "Categories", icon: <Tags size={18} />, href: "/admin/categories" },
        { name: "Service Areas", icon: <MapPin size={18} />, href: "/admin/locations" },
        { name: "Settings", icon: <Settings size={18} />, href: "/admin/settings" },
      ],
    },
  ];

  const NavLink = ({ item }: { item: any }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
          isActive
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
            : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
        }`}
      >
        <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`}>
          {item.icon}
        </span>
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-white border border-slate-200 rounded-lg shadow-sm"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[80] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-slate-100 z-[90] w-72 transition-transform duration-300
        lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col
      `}>
        
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-100 shadow-lg">
            <CheckCircle2 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-black text-slate-900 tracking-tight text-xl leading-none">QuickFix</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Control</p>
          </div>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Summary & Logout */}
        <div className="p-4 border-t border-slate-50 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                {user?.name?.charAt(0) || "A"}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name || "Administrator"}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase">System Online</p>
             </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
}