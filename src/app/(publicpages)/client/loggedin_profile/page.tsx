'use client';

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/constants"; 
import { getClientProfile } from "@/services/clientService"; 
import ClientPostList from "../components/ClientPostList"; 
import CreatePostModal from "@/components/CreatePostModal";
import { 
  MapPin, Edit3, User, Mail, Calendar, ShieldCheck, Loader2, Sparkles, PlusCircle, Globe
} from "lucide-react";

export default function LoggedInProfile() {
  const { user, hasHydrated, token } = useAuthStore(); 
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<any>(user?.profile || {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const currentToken = token || (user as any)?.token; 
      if (!currentToken) {
        setLoading(false);
        return;
      }
      try {
        const data = await getClientProfile(currentToken);
        if (data) {
           const finalData = data.profile || data; 
           setProfileData(finalData);
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

  if (!hasHydrated || !user) return null;

  const { state, district, city, profilePic } = profileData;

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const finalProfilePic = getImageUrl(profilePic) || getImageUrl((user as any).profilePic) || null;
  const coverImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"; 
  const locationString = [city, district, state].filter(Boolean).join(", ");

  if (loading && !profileData.city) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      
      {/* --- Cover Image & Header Overlay --- */}
      <div className="h-64 md:h-80 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${coverImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#F8FAFC]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-32 z-10">
        
        {/* 1. Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden mb-8">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-8 relative">
            
            {/* Profile Picture with Status Ring */}
            <div className="relative shrink-0">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl border-8 border-white shadow-xl overflow-hidden bg-slate-100 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                {finalProfilePic ? (
                  <img src={finalProfilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                    <User size={80} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-lg animate-pulse" title="Active Account" />
            </div>

            {/* Identity Information */}
            <div className="flex-1 w-full text-center md:text-left pb-2">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {profileData.name || user.name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest">
                      Verified Client
                    </span>
                    <span className="text-slate-500 text-sm flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={18} className="text-blue-500" /> Trust Score: 98%
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push("/client/clientprofile-form")} 
                  className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 hover:shadow-blue-200 active:scale-95 text-sm"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Contact & Location Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/50 border-t border-slate-100">
            
            {/* Email Address */}
            <div className="p-8 flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Contact</p>
                <p className="text-slate-800 font-bold truncate text-sm">{profileData.email || user.email}</p>
              </div>
            </div>

            {/* Member Date */}
            <div className="p-8 flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-purple-600">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Membership</p>
                <p className="text-slate-800 font-bold text-sm">Joined Feb 2024</p>
              </div>
            </div>

            {/* Location Detail */}
            <div className="p-8 flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-orange-500">
                <Globe size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                <p className="text-slate-800 font-bold text-sm leading-tight">
                    {locationString || "Update location"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Content Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Feed Section (Center Column) */}
            <div className="lg:col-span-8 space-y-8">
               
               {/* Professional Post Trigger */}
               <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex items-center gap-5">
                  <img src={finalProfilePic || ""} className="w-12 h-12 rounded-xl object-cover" alt="User" />
                  <div className="flex-1">
                    <CreatePostModal /> 
                  </div>
               </div>

               <ClientPostList /> 
            </div>

            {/* Sidebar Section (Right Column) */}
            <div className="hidden lg:block lg:col-span-4 space-y-8">
                
                {/* Statistics Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 sticky top-24">
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="text-yellow-500" size={24} />
                        <h3 className="font-bold text-xl text-slate-900 tracking-tight">Insight</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Your requirements are visible to <span className="text-blue-600 font-bold">400+ professionals</span> in the {profileData.district || 'current'} region.
                        </p>
                        
                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase">Profile Status</span>
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase">Requests Made</span>
                                <span className="text-slate-900 font-bold text-sm">12</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}