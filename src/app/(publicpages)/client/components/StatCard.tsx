"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
// FIX: Update import to clientService
import { getClientProfile } from "@/services/clientService"; 
import { FaTasks, FaClock, FaRunning, FaCheckCircle } from "react-icons/fa";

interface ClientStats {
  profile: {
    requests?: any[];
    activeJobs?: any[];
    completedJobs?: any[];
  };
}

export default function StatsCard() {
  const user = useAuthStore((state) => state.user);
  const [clientData, setClientData] = useState<ClientStats | null>(null);

  useEffect(() => {
    if (!user?.token) return;

    const loadClient = async () => {
      try {
        const data = await getClientProfile(user.token!);
        setClientData(data);
      } catch (err) {
        console.error("Error fetching client profile:", err);
      }
    };

    loadClient();
  }, [user?.token]);

  if (!clientData?.profile) {
    return (
      <div className="flex justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  // ... rest of your component remains the same ...
  const { requests = [], activeJobs = [], completedJobs = [] } = clientData.profile;

  const allRequests = requests.length + activeJobs.length + completedJobs.length;
  const pending = requests.filter((r: any) => r.status === "pending").length;
  const ongoing = activeJobs.length;
  const completed = completedJobs.length;

  const stats = [
    { title: "All Requests", value: allRequests, icon: <FaTasks size={24} className="text-blue-500" /> },
    { title: "Pending", value: pending, icon: <FaClock size={24} className="text-yellow-500" /> },
    { title: "Ongoing", value: ongoing, icon: <FaRunning size={24} className="text-blue-400" /> },
    { title: "Completed", value: completed, icon: <FaCheckCircle size={24} className="text-green-500" /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
}