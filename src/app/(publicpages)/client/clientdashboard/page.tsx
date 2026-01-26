"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "@/lib/constants";
// ✅ FIXED: Added 'Clock' to imports
import { Calendar, Loader2, TrendingUp, CheckCircle, Clock } from "lucide-react";

// Components
import JobGraph from "../components/JobGraph";
import RecentJobs from "../components/RecentJobs"; 
import RatingModal from "@/components/RatingModal"; 

export default function DashboardPage() {
  const { user, hasHydrated } = useAuthStore();
  const storeToken = useAuthStore((state: any) => state.token);

  const [token, setToken] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // 1. Hydrate Token
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(storeToken || localStorage.getItem("token"));
    }
  }, [storeToken]);

  // 2. Fetch Dashboard Data
 const refreshRequests = async () => {
    if (!token) return;

    try {
      console.log("📡 [DEBUG] Fetching Client Profile...");
      const { data } = await axios.get(`${API_URL}/client/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔍 LOOK AT THIS LOG IN YOUR BROWSER CONSOLE
      console.log("📦 [DEBUG] Raw Server Data:", data); 

      // Check if the keys exist
      console.log("Key Check - Requests:", data.requests);
      console.log("Key Check - Active:", data.activeJobs);
      console.log("Key Check - Completed:", data.completedJobs);

      const allJobs = [
        ...(data.requests?.map((j: any) => ({ ...j, status: "pending" })) || []),
        ...(data.activeJobs?.map((j: any) => ({ ...j, status: "ongoing" })) || []),
        ...(data.completedJobs?.map((j: any) => ({ ...j, status: "completed" })) || []),
      ];
      
      console.log(" Final Processed Jobs:", allJobs.length);
      setRequests(allJobs);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) refreshRequests();
    else if (hasHydrated && !token) setLoading(false);
  }, [token, hasHydrated]);

  // 3. Handle Rate Click
  const handleRateClick = (job: any) => {
    setSelectedJob(job);
    setIsRatingOpen(true);
  };

  // 4. Handle Rating Success
  const handleRatingSuccess = () => {
    setIsRatingOpen(false);
    refreshRequests(); 
  };

  if (!hasHydrated || loading) {
     return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8 font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, {user?.name}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600">
           <Calendar size={16} /> {new Date().toLocaleDateString()}
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={24} /></div>
            <div><p className="text-2xl font-bold text-slate-900">{requests.length}</p><p className="text-xs text-slate-500">Total Jobs</p></div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={24} /></div>
            <div>
                <p className="text-2xl font-bold text-slate-900">
                    {requests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-slate-500">Pending</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
            <div>
                <p className="text-2xl font-bold text-slate-900">
                    {requests.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-xs text-slate-500">Completed</p>
            </div>
         </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Graph */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4">Activity</h3>
            <div className="h-64 w-full">
                <JobGraph jobs={requests} />
            </div>
          </div>

          {/* Recent Jobs List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-50">
                <h3 className="font-bold text-slate-800">Recent Activity</h3>
             </div>
             <RecentJobs jobs={requests} onRateClick={handleRateClick} />
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg">
            <h4 className="font-bold text-lg mb-2">Need Help?</h4>
            <p className="text-slate-400 text-sm mb-4">Contact support if you have issues with a worker.</p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 rounded-lg border border-white/10 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {selectedJob && (
        <RatingModal 
            isOpen={isRatingOpen}
            onClose={() => setIsRatingOpen(false)}
            onSuccess={handleRatingSuccess}
            jobId={selectedJob._id || selectedJob.id}
            workerId={selectedJob.workerId?._id || selectedJob.workerId}
            workerName={selectedJob.workerName || selectedJob.workerId?.name || "Worker"}
            workerImage={selectedJob.workerImage || selectedJob.workerId?.profilePic}
            token={token!}
        />
      )}
    </div>
  );
}