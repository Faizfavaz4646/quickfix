"use client";

import React from "react";
import WorkerRating from "@/components/worker/WorkerRating";
import WorkerCompletedJobs from "@/components/worker/WorkerCompletedJobs";
import WorkerProfileCompletation from "@/components/worker/WorkerProfileCompletation";
import WorkerActiveJobs from "@/components/worker/WorkerActiveJobs";
import WorkerNewJobRequest from "@/components/worker/WorkerNewJobRequest";
import WorkerReviews from "@/components/worker/WorkerReviews";
import { useAuthStore } from "@/store/authStore";
import { Briefcase, CheckCircle, Star, TrendingUp } from "lucide-react";

export default function WorkerDashboard() {
  const { user } = useAuthStore();
  const userId = user?._id;

  // Standard Card Wrapper for consistency
  const DashboardCard = ({ title, children, icon: Icon }: any) => (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{title}</h3>
        {Icon && <Icon className="text-blue-500 w-5 h-5" />}
      </div>
      <div className="p-6 flex-1">{children}</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 lg:px-12 py-8">
      {/* ===== Header Section ===== */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium">
              Welcome back, <span className="text-blue-600 font-bold">{user?.name}</span>. Here is your status today.
            </p>
          </div>
          <div className="flex gap-3">
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100">
               Go Online
             </button>
          </div>
        </div>
      </header>

      {/* ===== Quick Stats Row ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Performance" icon={Star}>
             <WorkerRating userId={String(userId)} />
          </DashboardCard>
          
          <DashboardCard title="Active Projects" icon={Briefcase}>
             <WorkerActiveJobs />
          </DashboardCard>

          <DashboardCard title="Completed" icon={CheckCircle}>
             <WorkerCompletedJobs />
          </DashboardCard>

          <DashboardCard title="Earnings Profile" icon={TrendingUp}>
             <WorkerProfileCompletation />
          </DashboardCard>
      </div>

      {/* ===== Main Content Area ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Requests (Needs priority) */}
        <div className="lg:col-span-1">
           <DashboardCard title="New Requests">
              <WorkerNewJobRequest />
           </DashboardCard>
        </div>

        {/* Right Column: Reviews (Takes more horizontal space) */}
        <div className="lg:col-span-2">
           <DashboardCard title="Recent Reviews">
              {userId ? (
                <WorkerReviews userId={String(userId)} />
              ) : (
                <p className="text-sm text-gray-500 text-center py-10">No worker data available.</p>
              )}
           </DashboardCard>
        </div>
      </div>
    </main>
  );
}