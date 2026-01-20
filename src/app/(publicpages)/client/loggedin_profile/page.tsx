'use client';

import { useAuthStore } from "@/store/authStore";
import { FaUserCircle, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function LoggedInProfile() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) return null;
    
  const { state, district, city } = user.profile || {};

  return (
    <div className="min-h-screen mt-18 px-4">
      <h1 className="text-center text-5xl font-bold mb-2">User Profile</h1>
      <p className="text-center font-semibold mb-6">Manage your personal information</p>

      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-6 shadow-md max-w-3xl mx-auto">
        
        {/* Profile Picture */}
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow">
            {user.profile?.profilePic
              ? <img src={user.profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
              : <FaUserCircle size={56} className="text-gray-400" />}
          </div>
          
          {/* Name & Location */}
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-2xl">{user.name}</span>
            
            {/* Vertical Location */}
            <div className="mt-2 text-gray-600 text-sm flex flex-col gap-1">
              {state && <span>State: {state}</span>}
              {district && <span>District: {district}</span>}
              {city && <span>City: {city}</span>}
              {!state && !district && !city && <span>No location set</span>}
            </div>
          </div>
        </div>

        {/* Edit Profile Icon */}
        <button 
          onClick={() => router.push("/client/clientprofile-form")} // or your edit page
          className="text-gray-500 hover:text-gray-700"
          title="Edit Profile"
        >
          <FaEdit className="" size={20} />
           <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
    Edit Profile
  </span>
        </button>
      </div>
    </div>
  );
}
