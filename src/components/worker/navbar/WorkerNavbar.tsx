"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, X, Menu, LogOut } from "lucide-react";
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
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <>
    <nav className="w-full flex items-center justify-between bg-white shadow px-6 py-3 relative">
      {/* Left Section: Logo + Hamburger */}
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>

        {/* Logo */}
        <Link
          href="/publicpages/worker/dashboard"
          className="font-bold text-2xl flex items-center gap-2"
        >
          <FaTools className="text-blue-600" />
          QuickFix
        </Link>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-6 text-md font-semibold">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${
              pathname === link.href
                ? "text-blue-600 font-semibold"
                : "text-gray-600"
            } hover:text-blue-600`}
          >
            {link.label}
          </Link>
        ))}
        <button className="text-red-600 font-semibold hover:underline flex items-center gap-1">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Right section (Desktop only) */}
      <div className="hidden md:flex items-center gap-4">
        <div className="relative cursor-pointer">
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.4 rounded-full">
            3
          </span>
        </div>
      <Link href="/publicpages/worker/edit"><WorkerCard /></Link> 
      </div>

      {/* Mobile Sidebar Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50">
          <div
            ref={menuRef}
            className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg flex flex-col p-4"
          >
            {/* Worker Profile */}
            <div className="mb-6">
             <Link href="/publicpages/worker/edit"><WorkerCard /></Link> 
            </div>

            {/* Links */}
            <div className="flex flex-col gap-4 text-md font-semibold">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`${
                    pathname === link.href
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700"
                  } hover:text-blue-600`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Logout Button */}
            <div className="mt-auto">
              <button className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 flex items-center justify-center gap-2">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
