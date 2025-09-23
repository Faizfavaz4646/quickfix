"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MdDashboardCustomize,
  MdCategory,
  MdOutlineAnalytics,
} from "react-icons/md";
import { FaUsers, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import { BsFillClipboardDataFill } from "react-icons/bs";
import { HiOutlineMenu, HiX } from "react-icons/hi";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const links = [
    { name: "Dashboard", icon: <MdDashboardCustomize />, href: "/admin" },
    { name: "Clients & Workers", icon: <FaUsers />, href: "/admin/service_workers" },
    { name: "Jobs & Requests", icon: <RiShoppingCartLine />, href: "/admin/jobs" },
    { name: "Service Categories", icon: <MdCategory />, href: "/admin/categories" },
    { name: "Locations", icon: <FaMapMarkerAlt />, href: "/admin/locations" },
    { name: "Analytics", icon: <MdOutlineAnalytics />, href: "/admin/analytics" },
    { name: "Revenue", icon: <FaMoneyBillWave />, href: "/admin/revenue" },
    { name: "Reports", icon: <BsFillClipboardDataFill />, href: "/admin/reports" },
    { name: "Settings", icon: <MdDashboardCustomize />, href: "/admin/settings" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Burger Menu Button (top-left) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-[100] bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200"
      >
        <HiOutlineMenu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0  left-0 h-full w-64 bg-white text-gray-800 border-r border-gray-200 z-40 flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="font-bold text-lg text-gray-900">QuickFix Admin</span>
        </div>
        <nav className="flex-1 flex flex-col mt-4 px-2 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="ml-3 whitespace-nowrap">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-[110]md:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ${
            isOpen ? "opacity-10" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeSidebar}
        ></div>

        {/* Mobile Sidebar */}
        <aside className="fixed top-0 left-0 h-full w-64 bg-white text-gray-800 border-r border-gray-200 shadow-xl flex flex-col">
          {/* Header with Close Button at top-right */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <span className="font-bold text-lg text-gray-900 ml-13">QuickFix Admin</span>
            {/* Close button */}
            <button
              onClick={closeSidebar}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <HiX className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 flex flex-col mt-4 px-2 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeSidebar}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="ml-3 whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
