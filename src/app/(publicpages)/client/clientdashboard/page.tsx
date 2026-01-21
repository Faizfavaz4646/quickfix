"use client";

import Header from "@/app/(publicpages)/client/components/Header";
import StatCard from "@/app/(publicpages)/client/components/StatCard";
import GraphCard from "@/app/(publicpages)/client/components/GraphCard";
import { useAuthStore } from "@/store/authStore";
import RequestCard from "@/app/(publicpages)/client/components/RequestCard";
import { useEffect, useState } from "react";
import { Job } from "@/types/user";
import axios from "axios";
import JobGraph from "../components/JobGraph";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<Job[]>([]);

  const refreshRequests = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`http://localhost:3000/users/${user.id}`);
      const profile = res.data.profile;
      const allJobs: Job[] = [
        ...(profile?.requests?.map((job: Job) => ({ ...job, status: "pending" })) || []),
        ...(profile?.activeJobs?.map((job: Job) => ({ ...job, status: "ongoing" })) || []),
        ...(profile?.completedJobs?.map((job: Job) => ({ ...job, status: "completed" })) || []),
      ];
      setRequests(allJobs);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => { refreshRequests(); }, [user]);

  return (
    <>
      {/* Header Section */}
      <div className="bg-blue-600 px-6 py-10 md:py-12 md:rounded-bl-3xl md:rounded-br-3xl shadow-lg shadow-blue-900/10 mb-8">
        <div className="max-w-6xl mx-auto text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
             Welcome back, {user?.name} 👋
          </h2>
          <p className="text-blue-100 opacity-90">Here is your daily activity overview.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <StatCard />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1">
                 <GraphCard title="Request Activity">
                   <JobGraph jobs={requests} />
                 </GraphCard>
              </section>
              <RequestCard requests={requests} refreshRequests={refreshRequests} />
            </div>
            
            {/* Right Column (Optional for other widgets) */}
            <div className="space-y-6">
              {/* Add mini widgets here if needed */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}