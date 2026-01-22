'use client';

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/constants"; 
import { getClientProfile } from "@/services/clientService"; // Import the service
import { 
  MapPin, Edit3, User, Mail, Calendar, ShieldCheck, Loader2
} from "lucide-react";

export default function LoggedInProfile() {
  const { user, hasHydrated, token } = useAuthStore(); // Ensure token is pulled
  const router = useRouter();
  
  // Local state to hold the profile data
  // We initialize it with store data for instant display, but we will refresh it
  const [profileData, setProfileData] = useState<any>(user?.profile || {});
  const [loading, setLoading] = useState(true);

  // 1. Fetch Fresh Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      // Safe access to token
      const currentToken = token || (user as any)?.token; 
      
      if (!currentToken) {
        setLoading(false);
        return;
      }

      try {
        // Call your service
        const data = await getClientProfile(currentToken);
        
        if (data && data.profile) {
          // Update local state with fresh DB data
          setProfileData(data.profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    if (hasHydrated) {
      fetchData();
    }
  }, [hasHydrated, token, user]);

  if (!hasHydrated) return null;
  
  // 2. Fallback check for user existence
  if (!user) return null;

  // 3. Use profileData (Local State) instead of user.profile (Store)
  const { state, district, city, profilePic } = profileData;

  // --- Helper Functions ---
  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Check both profileData and user root for picture
  const finalProfilePic = getImageUrl(profilePic || (user as any).profilePic);
  
  const coverImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"; 
  const locationString = [city, district, state].filter(Boolean).join(", ");

  if (loading && !profileData.city) {
     // Only show loader if we have NO data to show yet
     return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      {/* --- Cover Image --- */}
      <div 
        className="h-56 md:h-72 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      </div>

      {/* --- Main Content Container --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24 z-10">
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-visible">
          
          {/* Header Section */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 border-b border-slate-100 pb-8 relative">
            
            {/* Profile Picture */}
            <div className="relative -mt-20 md:-mt-24 shrink-0 z-20">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-[6px] border-white shadow-md overflow-hidden bg-slate-100">
                {finalProfilePic ? (
                  <img 
                    src={finalProfilePic} 
                    alt="Profile" 
                    className="w-full h-full object-cover object-center" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                    <User size={64} />
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 right-4 bg-green-500 w-6 h-6 rounded-full border-[4px] border-white shadow-sm" title="Active Account"></div>
            </div>

            {/* Name & Role */}
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
                <div>
                  {/* Ensure Name comes from profileData or fallback to User */}
                  <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                    {profileData.name || user.name}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-blue-100">
                      Client
                    </span>
                    <span className="text-slate-500 text-sm flex items-center gap-1 font-medium">
                      <ShieldCheck size={16} className="text-green-500" /> Verified Account
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push("/client/clientprofile-form")}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-slate-50/30">
            
            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Contact Information</h3>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Mail size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Address</p>
                  <p className="text-slate-800 font-semibold truncate text-sm md:text-base">
                    {profileData.email || user.email || (user as any).emailId}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Joined</p>
                  <p className="text-slate-800 font-semibold text-sm md:text-base">Member since 2024</p>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Location Details</h3>

              <div className="bg-white border border-slate-100 rounded-2xl p-6 relative overflow-hidden h-full shadow-sm group">
                <MapPin className="absolute -right-6 -bottom-6 text-slate-50 w-40 h-40 rotate-12 group-hover:text-red-50 transition-colors duration-500" />
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">Primary Address</span>
                  </div>
                  
                  {locationString ? (
                    <div className="mt-auto">
                      <p className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                        {city || <span className="text-slate-300">City</span>}, <br/>
                        {district || <span className="text-slate-300">District</span>}, <br/>
                        {state || <span className="text-slate-300">State</span>}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-3 mt-auto">
                      <p className="text-slate-400 italic font-medium">No location set yet.</p>
                      <button 
                         onClick={() => router.push("/client/clientprofile-form")}
                         className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1"
                      >
                        <MapPin size={14} /> Add Location
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