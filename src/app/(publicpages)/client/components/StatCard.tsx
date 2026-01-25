"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getClientRequests } from "@/services/jobRequestHelper"; 
import { 
  LayoutDashboard, 
  Clock, 
  Activity, 
  CheckCircle2 
} from "lucide-react";

export default function StatCard() {
  const storeToken = useAuthStore((state: any) => state.token);
  const [token, setToken] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    ongoing: 0,
    completed: 0
  });
  
  const [loading, setLoading] = useState(true);

  // 1. Hydrate Token
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(storeToken || localStorage.getItem("token"));
    }
  }, [storeToken]);

  // 2. Fetch Data
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        const allJobs = await getClientRequests(token);

        // ✅ FIX: Only check for DB statuses ('accepted'), not UI labels ('ongoing')
        const pendingCount = allJobs.filter(job => job.status === "pending").length;
        
        // In your DB, active jobs are "accepted". We map this to the "Ongoing" stat.
        const activeCount = allJobs.filter(job => job.status === "accepted").length;
        
        const completedCount = allJobs.filter(job => job.status === "completed").length;

        setStats({
          total: allJobs.length,
          pending: pendingCount,
          ongoing: activeCount,
          completed: completedCount
        });

      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
        fetchStats();
    } else {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {[1,2,3,4].map((i) => (
             <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse" />
         ))}
      </div>
    );
  }

  const statItems = [
    { 
      title: "All Jobs", 
      value: stats.total, 
      icon: <LayoutDashboard size={24} />, 
      bg: "bg-blue-50", 
      color: "text-blue-600" 
    },
    { 
      title: "Pending", 
      value: stats.pending, 
      icon: <Clock size={24} />, 
      bg: "bg-yellow-50", 
      color: "text-yellow-600" 
    },
    { 
      title: "Ongoing", 
      value: stats.ongoing, 
      icon: <Activity size={24} />, 
      bg: "bg-purple-50", 
      color: "text-purple-600" 
    },
    { 
      title: "Completed", 
      value: stats.completed, 
      icon: <CheckCircle2 size={24} />, 
      bg: "bg-green-50", 
      color: "text-green-600" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between transition-transform hover:scale-[1.02] duration-200">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{stat.title}</p>
            <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
          </div>
          <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}