"use client";

import StatCard from "@/app/(publicpages)/client/components/StatCard";
import GraphCard from "@/app/(publicpages)/client/components/GraphCard";
import RequestCard from "@/app/(publicpages)/client/components/RequestCard";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Job } from "@/types/user";
import axios from "axios";
import JobGraph from "../components/JobGraph";
import { Calendar, Filter, Loader2 } from "lucide-react"; 
import { API_URL } from "@/lib/constants"; // ✅ Use your constant

export default function DashboardPage() {
  const { user, token, hasHydrated } = useAuthStore(); // ✅ Get token & hydration state
  const [requests, setRequests] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRequests = async () => {
    // 1. Safety Check: Need token to fetch profile
    const authToken = token || (user as any)?.token;
    if (!authToken) return;

    try {
      // ✅ FIX: Use the Client Profile endpoint we fixed earlier
      const { data } = await axios.get(`${API_URL}/client/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // 2. Map the data correctly
      // The endpoint returns the profile object directly now
      const allJobs: Job[] = [
        ...(data.requests?.map((job: any) => ({ ...job, status: "pending" })) || []),
        ...(data.activeJobs?.map((job: any) => ({ ...job, status: "ongoing" })) || []),
        ...(data.completedJobs?.map((job: any) => ({ ...job, status: "completed" })) || []),
      ];

      setRequests(allJobs);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasHydrated && user) {
      refreshRequests();
    }
  }, [hasHydrated, user]);

  // Loading State
  if (!hasHydrated || loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8">
      
      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-600">
            <Calendar size={16} className="text-slate-400" />
            <span>{new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
          <button className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </header>

      {/* 2. Stats Section - Pass data if needed, or let it fetch internally */}
      <section>
        <StatCard />
      </section>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Graph Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Activity Analytics</h3>
            </div>
            <div className="p-6">
               <GraphCard title="">
                 <JobGraph jobs={requests} />
               </GraphCard>
            </div>
          </div>

          {/* Recent Requests List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Recent Requests</h3>
             </div>
             <div className="p-0">
               {/* Pass refresh function so user can update list after actions */}
               <RequestCard requests={requests} refreshRequests={refreshRequests} />
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
            <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
            <p className="text-slate-300 text-sm mb-4">
              Complete your profile verification to get responses 2x faster from workers.
            </p>
            <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors border border-white/10">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}