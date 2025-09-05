
"use client";

import Sidebar from "@/app/(publicpages)/client/components/Sidebar";
import Header from "@/app/(publicpages)/client/components/Header";
import StatCard from "@/app/(publicpages)/client/components/StatCard";
import GraphCard from "@/app/(publicpages)/client/components/GraphCard";
import { useAuthStore } from "@/types/user";

const requestStats = [
  { title: "All Requests", value: "1,250" },
  { title: "Pending", value: "230" },
  { title: "Ongoing", value: "540" },
  { title: "Completed", value: "480" },
];

export default function DashboardLayout() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Header: full width */}
      <Header>
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center -mt-40">
          👋 Welcome back, {user?.name}
        </h2>
        <p className="text-white/90 text-center">Here’s your dashboard overview</p>
      </Header>

      {/* Content area */}
      <div className="flex relative">
        {/* Fixed Sidebar */}
   
          <Sidebar />
        

        {/* Main content with margin to avoid overlap */}
        <main className="ml-20 md:ml-64 flex-1 p-6 -mt-50">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {requestStats.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>

          {/* Graph Section */}
          <div className="mt-10">
            <GraphCard title="Sales Overview">
              <p className="text-gray-500">Line chart will go here 📈</p>
            </GraphCard>
          </div>
        </main>
      </div>
    </div>
  );
}
