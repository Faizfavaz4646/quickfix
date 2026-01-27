'use client';

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyWorkerProfile } from "@/services/workerService"; 
import { Profile } from "@/types/user";
import { API_URL } from "@/lib/constants"; 
import { 
  MapPin, Phone, Mail, Edit3, Calendar, 
  Briefcase, Star, CheckCircle, Award, Loader2, AlertCircle
} from "lucide-react";

export default function WorkerProfilePage() {
  // ✅ FIX 1: Extract 'token' directly from the store
  const { user, token, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🔍 DEBUG 1: Check initial store state
    console.log("🔄 [WorkerProfile] Effect Triggered", { hasHydrated, userExists: !!user, tokenExists: !!token });

    if (!hasHydrated) {
      console.log("⏳ [WorkerProfile] Still hydrating store...");
      return;
    }

    if (!user) {
      console.error("❌ [WorkerProfile] No User found in AuthStore");
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // ✅ FIX 2: Check the standalone 'token' variable, not 'user.token'
    if (!token) {
      console.error("❌ [WorkerProfile] User exists but NO TOKEN found in store.");
      setError("Authentication token missing. Please log in again.");
      setLoading(false);
      return;
    }

    // 🔍 DEBUG 3: Starting Fetch
    console.log("🚀 [WorkerProfile] Fetching profile with token:", token.substring(0, 10) + "...");
    setLoading(true);

    // ✅ FIX 3: Pass the correct token variable
    getMyWorkerProfile(token)
      .then((data) => {
        console.log("✅ [WorkerProfile] API Success. Data:", data);
        if (data) {
          setWorkerProfile(data);
        } else {
          console.warn("⚠️ [WorkerProfile] API returned empty data");
          setError("Profile data is empty");
        }
      })
      .catch((err) => {
        console.error("🔥 [WorkerProfile] API Failed:", err);
        if (err.response) {
          console.error("   Status:", err.response.status);
          console.error("   Data:", err.response.data);
        }
        setError(err.message || "Failed to load profile");
      })
      .finally(() => {
        console.log("🏁 [WorkerProfile] Fetch finished. Stopping loader.");
        setLoading(false);
      });
  }, [hasHydrated, user, token]); // ✅ FIX 4: Add 'token' to dependency array

  // 1. Waiting for Store
  if (!hasHydrated) return null;

  // 2. Handle Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-500 font-medium">Loading Profile...</p>
      </div>
    );
  }

  // 3. Handle Errors
  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Profile</h2>
          <p className="text-slate-600 mb-6 bg-red-50 p-2 rounded text-sm font-mono">
            {error || "User not found"}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push("/auth/login")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Display Helpers ---
  const getImageUrl = (path?: string) => {
    if (!path) return "/images/avatar.avif";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const profileImage = getImageUrl(workerProfile?.profilePic || user.profilePic);
  const coverImage = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop"; 
  const profession = workerProfile?.profession || user.profession || "Worker";
  const rating = (workerProfile?.avgRating || 0).toFixed(1);
  const jobsCompleted = workerProfile?.completedJobs?.length || 0;
  
  const displayEmail = 
    user.email ||                           
    (user as any).emailId ||                
    workerProfile?.email ||                 
    (workerProfile as any)?.userId?.email || 
    "No Email Found";

  const addressParts = [workerProfile?.city, workerProfile?.district, workerProfile?.state].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(", ") : "Location not set";

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div 
        className="h-60 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-24">
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 relative overflow-hidden">
          
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/images/avatar.avif"; }}
              />
            </div>
            <div className="absolute bottom-4 right-4 sm:bottom-2 sm:right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-white" title="Active"></div>
          </div>

          <div className="flex-1 pt-2 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h1>
                <p className="text-blue-600 font-bold text-lg flex items-center gap-2 mt-1">
                  <Briefcase className="w-5 h-5" />
                  {profession}
                </p>
              </div>
              
              <button
                onClick={() => router.push("/worker/edit")}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 font-medium text-sm">
                <MapPin className="w-4 h-4 text-red-500" />
                {address}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 font-medium text-sm">
                <Calendar className="w-4 h-4 text-blue-500" />
                Joined {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className="text-xs text-slate-400 font-bold uppercase">Email</span>
                    {/* DISPLAY EMAIL */}
                    <span className="text-sm font-medium truncate break-all" title={displayEmail}>
                      {displayEmail}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-bold uppercase">Phone</span>
                    <span className="text-sm font-medium">{workerProfile?.phone || "Not Added"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Working Hours</h3>
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">
                 {workerProfile?.schedule ? (
                   <span className="text-slate-700 font-semibold">{workerProfile.schedule}</span>
                 ) : (
                   <span className="text-slate-400 italic">No schedule available</span>
                 )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="bg-yellow-50 p-3 rounded-full mb-3 text-yellow-600">
                  <Star className="w-6 h-6 fill-yellow-500" />
                </div>
                <h4 className="text-2xl font-black text-slate-800">{rating}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Avg Rating</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-3 text-blue-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-black text-slate-800">{jobsCompleted}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Jobs Done</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="bg-purple-50 p-3 rounded-full mb-3 text-purple-600">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-black text-slate-800">Pro</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Level</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Portfolio</h3>
                <span className="text-xs font-semibold bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                  {workerProfile?.previousWorkImages?.length || 0} items
                </span>
              </div>
              
              {workerProfile?.previousWorkImages && workerProfile.previousWorkImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {workerProfile.previousWorkImages.map((img, index) => {
                     const src = getImageUrl(img);
                     return (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm group cursor-pointer relative bg-slate-100">
                        <img 
                          src={src} 
                          alt={`Work ${index}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                             e.currentTarget.style.display = 'none'; 
                          }}
                        />
                      </div>
                     );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-500 font-medium">No portfolio images added yet.</p>
                  <button 
                    onClick={() => router.push("/worker/edit")}
                    className="text-blue-600 text-sm font-bold mt-2 hover:underline"
                  >
                    Upload Work
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}