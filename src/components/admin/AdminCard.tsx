"use client";

import { useEffect, useState } from "react";
import { fetchDashboardStats, fetchClientSatisfaction } from "@/services/adminService";
import { Users, HardHat, Briefcase, Star, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface CardProps {
  title: string;
  value: string | number;
  change: string;
  isUp: boolean;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, change, isUp, icon, color }: CardProps) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 transition-colors group-hover:bg-opacity-20`}>
        <div className={`${color.replace('bg-', 'text-')}`}>
          {icon}
        </div>
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
        isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
      }`}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
      </div>
    </div>
    
    <div className="mt-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-3xl font-black text-slate-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <span className="text-[10px] text-slate-400 font-medium">live sync</span>
      </div>
    </div>
  </div>
);

export default function DashboardCards() {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    jobs: 0,
    satisfaction: 0,
    loading: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // 🔥 This calls http://localhost:5001/admin/stats
        const [dashboardData, rating] = await Promise.all([
          fetchDashboardStats(),
          fetchClientSatisfaction()
        ]);

        setStats({
          users: dashboardData?.users ?? 0,
          posts: dashboardData?.posts ?? 0,
          jobs: dashboardData?.jobs ?? 0,
          satisfaction: rating ?? 4.5,
          loading: false
        });
      } catch (error) {
        console.error("Dashboard Stats loading error:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse border border-slate-50 flex items-center justify-center">
             <Loader2 className="animate-spin text-slate-200" size={24} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      <StatCard
        title="Total Users"
        value={stats.users}
        change="12%"
        isUp={true}
        icon={<Users size={22} />}
        color="bg-indigo-600"
      />
      <StatCard
        title="Platform Posts"
        value={stats.posts}
        change="24%"
        isUp={true}
        icon={<HardHat size={22} />}
        color="bg-blue-500"
      />
      <StatCard
        title="Job Requests"
        value={stats.jobs}
        change="3%"
        isUp={false}
        icon={<Briefcase size={22} />}
        color="bg-rose-500"
      />
      <StatCard
        title="Avg Rating"
        value={`${stats.satisfaction}/5`}
        change="0.2"
        isUp={true}
        icon={<Star size={22} />}
        color="bg-amber-500"
      />
    </div>
  );
}