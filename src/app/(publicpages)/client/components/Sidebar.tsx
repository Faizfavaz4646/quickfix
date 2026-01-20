"use client";

import { useState } from "react";
import { MdDashboard } from "react-icons/md";
import {
  FaBriefcase,
  FaListAlt,
  FaBell,
  FaWallet,
  FaCog,
  FaHome,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";
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
    { key: "dashboard", label: "Dashboard", icon: <MdDashboard className="text-xl" />, path: "/client/clientdashboard" },
    { key: "jobs", label: "Jobs", icon: <FaBriefcase className="text-lg" />, path: "/client/clientdashboard/jobs" },
    { key: "requests", label: "Requests", icon: <FaListAlt className="text-lg" />, path: "/client/clientdashboard/requests" },
    { key: "notifications", label: "Notifications", icon: <FaBell className="text-lg" />, path: "/client/clientdashboard/notifications", count: unreadCount },
    { key: "payments", label: "Payments", icon: <FaWallet className="text-lg" />, path: "/client/clientdashboard/payments" },
    { key: "settings", label: "Settings", icon: <FaCog className="text-lg" />, path: "/client/clientdashboard/settings" },
  ];

  return (
    <>
      {/* Burger Button - Mobile only */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md "
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-40
          w-64 p-6 transform transition-transform duration-300
          md:translate-x-0 md:top-6 md:left-6 md:rounded-2xl md:h-[700px]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Logo + Menu */}
          <div>
            <h1 className="text-4xl font-bold text-sky-600 mb-8 flex items-center justify-center mt-10">
              <FaHome />
            </h1>
            <nav className="flex flex-col gap-4">
              {menu.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-sky-100 text-sky-600 font-semibold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>

                    {/* Notification badge */}
                    {item.key === "notifications" && item.count && item.count > 0 && (
                      <span className="absolute right-3 top-2 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Help Section */}
          <div className="flex flex-col items-center text-sm text-gray-500 mt-8">
            <Image
              src="/images/folderimage.jpg"
              alt="Help Icon"
              width={90}
              height={90}
              className="mb-3 w-32"
            />
            <p className="font-medium">Need help?</p>
            <p>Please check our docs.</p>
          </div>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
