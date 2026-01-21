"use client";

import StatCard from "@/app/(publicpages)/client/components/StatCard";
import GraphCard from "@/app/(publicpages)/client/components/GraphCard";
import RequestCard from "@/app/(publicpages)/client/components/RequestCard";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Job } from "@/types/user";
import axios from "axios";
import JobGraph from "../components/JobGraph";
import { Calendar, Filter } from "lucide-react"; // Optional: for UI polish

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRequests = async () => {
    // Robust check for ID (handles both _id and id)
    const userId = user?._id || user?._id;
    if (!userId) return;

    try {
      const res = await axios.get(`http://localhost:5001/users/${userId}`);
      const profile = res.data.profile;

      const allJobs: Job[] = [
        ...(profile?.requests?.map((job: Job) => ({ ...job, status: "pending" })) || []),
        ...(profile?.activeJobs?.map((job: Job) => ({ ...job, status: "ongoing" })) || []),
        ...(profile?.completedJobs?.map((job: Job) => ({ ...job, status: "completed" })) || []),
      ];

      setRequests(allJobs);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRequests();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8">
      
      {/* 1. Page Header (Clean & Minimal) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. Here's what's happening today.
          </p>
        </div>

        {/* Optional: Date / Filter Actions */}
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

      {/* 2. Stats Section */}
      <section>
        <StatCard />
      </section>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Main Data) - Spans 2 columns on large screens */}
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
               <RequestCard requests={requests} refreshRequests={refreshRequests} />
             </div>
          </div>
        </div>

        {/* Right Column (Widgets/Info) */}
        <div className="space-y-8">
          
          {/* Mini Profile / Status Widget (Example) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
            <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
            <p className="text-slate-300 text-sm mb-4">
              Complete your profile verification to get responses 2x faster from workers.
            </p>
            <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors border border-white/10">
              View Profile
            </button>
          </div>

          {/* You can add a "Recent Notifications" or "Support" widget here */}
        </div>
      </div>
    </div>
  );
}