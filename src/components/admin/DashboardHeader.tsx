"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { toast } from "sonner";


export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const logout = useAuthStore((state) => state.logout);
    const router=useRouter()
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


  return (
    <header className="bg-white p-4 shadow-md flex items-center justify-between">
      {/* Heading on the left */}
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Search bar in the center */}
      <div className="flex-1 max-w-md mx-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Rounded profile on the right */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-10 h-10 bg-blue-600 text-white font-bold flex items-center justify-center rounded-full"
        >
          AD
        </button>

        {/* Dropdown menu (dialog box) */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
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
        )}
      </div>
    </header>
  );
}