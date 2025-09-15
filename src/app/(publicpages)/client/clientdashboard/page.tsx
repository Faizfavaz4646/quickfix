"use client";

import Sidebar from "@/app/(publicpages)/client/components/Sidebar";
import Header from "@/app/(publicpages)/client/components/Header";
import StatCard from "@/app/(publicpages)/client/components/StatCard";
import GraphCard from "@/app/(publicpages)/client/components/GraphCard";
import { useAuthStore } from "@/store/authStore";
import RequestCard from "@/app/(publicpages)/client/components/RequestCard";
import { useEffect, useState } from "react";
import { Job,Notification } from "@/types/user";
import axios from "axios";

export default function DashboardLayout() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
 

  // Fetch client requests and merge all jobs
  const refreshRequests = async () => {
    if (!user?.id) return;

    try {
      const res = await axios.get(`http://localhost:50001/users/${user.id}`);
      const profile = res.data.profile;

      // Merge all jobs into a single array
      const allJobs: Job[] = [
        ...(profile?.requests?.map((job: Job) => ({ ...job, status: "pending" })) || []),
        ...(profile?.activeJobs?.map((job: Job) => ({ ...job, status: "ongoing" })) || []),
        ...(profile?.completedJobs?.map((job: Job) => ({ ...job, status: "completed" })) || []),
      ];

      setRequests(allJobs);
        // Fetch notifications
      setNotifications(profile?.notifications || []);
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      setRequests([]);
      setNotifications([]);
    }
  };
  

  useEffect(() => {
    refreshRequests();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ✅ Header: always full width */}
      <Header>
        <div className="flex flex-col items-center justify-center py-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
            👋 Welcome back, {user?.name}
          </h2>
          <p className="text-white/90 text-center mt-2 text-sm sm:text-base">
            Here’s your dashboard overview
          </p>
        </div>
      </Header>

      {/* ✅ Main area: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar (collapses on small screens) */}
        <div className="hidden md:block">
          <Sidebar notifications={notifications}  />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6">
          {/* Stat Cards */}
          <section>
            <StatCard />
          </section>

          {/* Graph Section */}
          <section className="mt-10">
            <GraphCard title="Sales Overview">
              <p className="text-gray-500 text-center sm:text-left">
                Line chart will go here 📈
              </p>
            </GraphCard>
          </section>

          {/* Requests Section */}
          <section className="mt-10">
            <RequestCard 
              requests={requests} 
              refreshRequests={refreshRequests} 
            />
          </section>
        </main>
      </div>
    </div>
  );
}
