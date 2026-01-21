'use client';

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/constants"; 
import { 
  MapPin, 
  Edit3, 
  User, 
  Mail, 
  Calendar,
  ShieldCheck,
  Loader2
} from "lucide-react";

export default function LoggedInProfile() {
  const { user, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Simulate a short load to ensure data is ready
  useEffect(() => {
    if (hasHydrated) setLoading(false);
  }, [hasHydrated]);

  // 1. Guard Clauses
  if (!hasHydrated) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!user) return null;

  // 2. Data Extraction
  const { state, district, city, profilePic } = user.profile || {};

  // 3. Image Helper (Handles relative vs absolute URLs)
  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const finalProfilePic = getImageUrl(profilePic || user.profilePic);
  const coverImage = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000&auto=format&fit=crop"; // Abstract Office/Blue theme

  // 4. Location Formatter
  const locationString = [city, district, state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      {/* --- Cover Image --- */}
      <div 
        className="h-48 md:h-64 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
      </div>

      {/* --- Main Content Container --- */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-20">
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Header Section */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end gap-6 border-b border-slate-100 pb-8">
            
            {/* Profile Picture (Overlapping) */}
            <div className="relative -mt-16 md:-mt-20 shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
                {finalProfilePic ? (
                  <img 
                    src={finalProfilePic} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                    <User size={64} />
                  </div>
                )}
              </div>
              {/* Status Dot */}
              <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-white" title="Active Account"></div>
            </div>

            {/* Name & Role */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-blue-100">
                      Client Account
                    </span>
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <ShieldCheck size={14} /> Verified
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <button 
                  onClick={() => router.push("/client/clientprofile-form")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 text-sm"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Left Column: Contact Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Information</h3>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="bg-white p-2.5 rounded-full shadow-sm text-blue-600">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="text-slate-800 font-medium break-all">
                    {user.email || (user as any).emailId || "No email linked"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="bg-white p-2.5 rounded-full shadow-sm text-purple-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Member Since</p>
                  <p className="text-slate-800 font-medium">2024</p>
                </div>
              </div>
            </div>

            {/* Right Column: Location Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Location Details</h3>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative overflow-hidden">
                {/* Decorative Map Icon Background */}
                <MapPin className="absolute -right-4 -bottom-4 text-slate-200/50 w-32 h-32 rotate-12" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-slate-500 text-sm font-medium">Current Address</span>
                  </div>
                  
                  {locationString ? (
                    <div>
                      <p className="text-xl font-bold text-slate-800 leading-relaxed">
                        {city || <span className="text-slate-400 italic">City</span>}, <br/>
                        {district || <span className="text-slate-400 italic">District</span>}, <br/>
                        {state || <span className="text-slate-400 italic">State</span>}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-slate-400 italic">No location set yet.</p>
                      <button 
                         onClick={() => router.push("/client/clientprofile-form")}
                         className="text-blue-600 text-sm font-bold hover:underline"
                      >
                        Add Location
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}