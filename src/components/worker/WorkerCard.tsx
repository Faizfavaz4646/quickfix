"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Profile } from "@/types/user";
import { getWorkerProfile } from "@/services/workerService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const WorkerCard = () => {
  const { user } = useAuthStore();
  const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!user?.id) return;

    getWorkerProfile(user.id.toString())
      .then((data) => {
        if (data) setWorkerProfile(data);
      })
      .catch((err) => {
        console.error("Failed to fetch worker profile:", err);
      });
  }, [user?.id]);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user || !workerProfile) return null;

  const handleLogout = () => {
    toast("Are you sure you want to signout?", {
      action: {
        label: "Yes",
        onClick: () => {
          logout();
          router.push("/auth/login");
          toast.success("You have been signed out.");
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
    <div className="relative">
      {/* Profile Pic */}
      <img
        src={workerProfile.profilePic || "/images/avatar.avif"}
        alt="Profile"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-gray-200 cursor-pointer"
        onError={(e) => {
          e.currentTarget.src = "/images/avatar.avif";
        }}
        onClick={() => setOpen((prev) => !prev)}
      />

      {/* Overlay (light opacity) */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40"></div>
      )}

      {/* Dropdown Modal */}
      {open && (
        <div
          ref={modalRef}
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg z-50 p-4"
        >
          {/* Header with close */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <img
                src={workerProfile.profilePic || "/images/avatar.avif"}
                alt="Profile"
                className="w-8 h-8 rounded-full border"
              />
              <span className="font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
          </div>

          {/* Options */}
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/worker/edit");
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Your Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/settings");
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Settings
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-red-100 text-red-600"
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkerCard;
