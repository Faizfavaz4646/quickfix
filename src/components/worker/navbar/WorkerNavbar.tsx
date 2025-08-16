"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import WorkerCard from "@/components/worker/WorkerCard";
import { FaTools } from "react-icons/fa";

export default function WorkerNavbar() {
  const pathname = usePathname();

  const links = [
    { href: "/publicpages/worker/dashboard", label: "Dashboard" },
    { href: "/worker/messages", label: "Messages" },
    { href: "/worker/settings", label: "Settings" },
  ];

  return (
    <nav className="w-full flex items-center justify-between bg-white shadow px-6 py-3">
      {/* Left logo */}
      <Link href="/publicpages/worker/dashboard" className="font-bold text-xl flex items-center gap-2">
       <FaTools className="text-blue-600" />
        QuickFix
      </Link>

      {/* Center nav links */}
      <div className="flex gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${
              pathname === link.href ? "text-blue-600 font-semibold" : "text-gray-600"
            } hover:text-blue-600`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right section: notifications + profile */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative cursor-pointer">
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.4 rounded-full">
            3
          </span>
        </div>

        {/* Profile card (reusable) */}
        <WorkerCard />
      </div>
    </nav>
  );
}
