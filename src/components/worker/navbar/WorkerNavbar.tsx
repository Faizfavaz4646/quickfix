"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, X, Menu } from "lucide-react";
import WorkerCard from "@/components/worker/WorkerCard";
import { FaTools } from "react-icons/fa";

export default function WorkerNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/publicpages/worker/dashboard", label: "Dashboard" },
    { href: "/publicpages/worker/reviews", label: "Reviews" },
    { href: "/worker/messages", label: "Messages" },
    { href: "/worker/settings", label: "Settings" },
  ];

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav className="w-full flex items-center justify-between bg-white shadow px-6 py-3 relative">
      {/* Left logo */}
      <div className="flex items-center gap-2">
        <FaTools className="text-blue-600 text-xl" />
        <Link href="/publicpages/worker/dashboard" className="font-bold text-2xl">
          QuickFix
        </Link>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-6 text-md font-semibold">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`$${
              pathname === link.href ? "text-blue-600 font-semibold" : "text-gray-600"
            } hover:text-blue-600`}
          >
            {link.label}
          </Link>
        ))}
        <button className="text-red-600 font-semibold hover:underline">Logout</button>
      </div>

      {/* Right section (desktop only): notifications + profile */}
      <div className="hidden md:flex items-center gap-4">
        <div className="relative cursor-pointer">
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.4 rounded-full">
            3
          </span>
        </div>
        <WorkerCard />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-3">
        <WorkerCard />
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-7 h-7 text-gray-800" /> : <Menu className="w-7 h-7 text-gray-800" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 w-64 h-screen bg-white shadow-lg p-6 flex flex-col gap-6 md:hidden z-50"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`$${
                pathname === link.href ? "text-blue-600 font-semibold" : "text-gray-600"
              } hover:text-blue-600`}
            >
              {link.label}
            </Link>
          ))}
          <button className="text-red-600 font-semibold hover:underline mt-auto">Logout</button>
        </div>
      )}
    </nav>
  );
}
