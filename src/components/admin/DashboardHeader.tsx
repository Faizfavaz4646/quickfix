"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { toast } from "sonner";

export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const admin = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("admin") || "{}") : {};
  const adminEmail = admin?.email || "admin@example.com";

  const handleLogout = () => {
    toast("Are you sure you want to logout?", {
      action: {
        label: "Yes",
        onClick: () => {
          logout();
          setIsMenuOpen(false);
          router.push("/auth/login");
          toast.success("You have been logged out.");
        },
      },
      cancel: {
        label: "No",
        onClick: () => toast.dismiss(),
      },
      duration: 10000,
    });
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-md px-6 py-8 sm:py-6 min-h-[150px] relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-900 mt-8">Admin Dashboard</h1>

      {/* Search */}
      <div className="w-full sm:max-w-md">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mt-8"
        />
      </div>

      {/* Profile button */}
      <div ref={menuRef} className="absolute top-6 right-6 sm:relative sm:top-0 sm:right-0 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-12 h-12 bg-blue-600 text-white font-bold flex items-center justify-center rounded-full z-50 mt-8"
        >
          AD
        </button>

        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/10 z-40"
              onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {/* Email & Close Button */}
              <div className="flex justify-between items-center p-2 border-b border-gray-200">
                {/* Admin Email */}
                <span className="text-blue-600 font-medium text-sm truncate">
                  {adminEmail}
                </span>

                {/* Close button */}
                <button
                  className="text-gray-500 hover:text-gray-800 font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ×
                </button>
              </div>

              <ul className="py-2">
                <li>
                  <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <FaUser className="mr-2" />
                    Profile
                  </button>
                </li>
                <li>
                  <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <MdSettings className="mr-2" />
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
