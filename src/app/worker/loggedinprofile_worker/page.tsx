'use client';

import { useAuthStore } from "@/store/authStore";
import { FaUserCircle, FaEdit, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { GrUserWorker } from "react-icons/gr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getWorkerProfile } from "@/services/workerService";
import { Profile } from "@/types/user";

export default function WorkerProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    getWorkerProfile(user.id.toString())
      .then((data) => {
        if (data) setWorkerProfile(data);
      })
      .catch((err) => console.error("Failed to fetch worker profile:", err));
  }, [user?.id]);

  if (!user) return null;

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold">Worker Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal and professional information</p>
      </div>

      {/* Profile Card */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 relative">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-md">
            {workerProfile?.profilePic
              ? <img src={workerProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
              : <FaUserCircle size={80} className="text-gray-400" />}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>

            {/* Edit Profile */}
            <button
              onClick={() => router.push("/worker/edit")}
              className="relative group text-gray-500 hover:text-gray-700"
            >
              <FaEdit size={20} />
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Edit Profile
              </span>
            </button>
          </div>

          {/* Profession */}
          {workerProfile?.profession && (
            <p className="flex items-center text-blue-700 font-medium gap-2">
              <GrUserWorker /> {workerProfile.profession}
            </p>
          )}

          {/* Location (stacked) */}
          {(workerProfile?.state || workerProfile?.district || workerProfile?.city) && (
            <div className="flex flex-col text-blue-600 gap-1">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt /> <span className="font-medium"></span> {workerProfile?.state || "-"}
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt /> <span className="font-medium"></span> {workerProfile?.district || "-"}
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt /> <span className="font-medium"></span> {workerProfile?.city || "-"}
              </div>
            </div>
          )}

          {/* Phone */}
          {workerProfile?.phone && (
            <div className="flex items-center gap-2 text-blue-600">
              <FaPhone /> <span className="font-medium">Phone:</span> {workerProfile.phone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
