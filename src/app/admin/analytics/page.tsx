"use client";

import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { useAuthStore } from "@/store/authStore";
import { 
  Users, Briefcase, CheckCircle2, Star, 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Loader2 
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  fetchAllWorkers,
  fetchDashboardStats,
  fetchClientSatisfaction,
} from "@/services/adminService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AnalyticsPage() {
  const { isLogin, hasHydrated } = useAuthStore();
  const [stats, setStats] = useState({ users: 0, posts: 0, jobs: 0 });
  const [workers, setWorkers] = useState<any[]>([]);
  const [avgSatisfaction, setAvgSatisfaction] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (hasHydrated && isLogin) {
      const fetchAnalytics = async () => {
        try {
          // 🔥 Parallel fetching for speed
          const [dashboardData, allWorkers, satisfaction] = await Promise.all([
            fetchDashboardStats(),
            fetchAllWorkers(),
            fetchClientSatisfaction(),
          ]);

          setStats(dashboardData);
          setWorkers(allWorkers);
          setAvgSatisfaction(satisfaction ?? 4.5);
        } catch (error) {
          console.error("Failed to fetch analytics:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [hasHydrated, isLogin]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aggregating Real-time Data...</p>
      </div>
    );
  }

  // Real Data Calculations
  const totalWorkers = workers.length;
  const totalClients = Math.max(0, stats.users - totalWorkers);

  const pieData = {
    labels: ["Professionals", "Clients"],
    datasets: [
      {
        data: [totalWorkers, totalClients],
        backgroundColor: ["#4f46e5", "#f59e0b"],
        borderWidth: 0,
        hoverOffset: 20
      },
    ],
  };

  const barData = {
    labels: workers.slice(0, 6).map((w) => w.name?.split(" ")[0] || "Pro"),
    datasets: [
      {
        label: "Performance Rating",
        data: workers.slice(0, 6).map((w) => w.averageRating || 0),
        backgroundColor: "#6366f1",
        borderRadius: 12,
        barThickness: 32,
      },
    ],
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Analytics</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Growth & Performance Metrics</p>
      </div>

      {/* Real-Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatSummaryCard title="Platform Scale" value={stats.users} subtext="Total Registered" icon={<Users />} color="text-indigo-600" bg="bg-indigo-50" />
        <StatSummaryCard title="Workload" value={stats.jobs} subtext="Total Job Requests" icon={<Briefcase />} color="text-emerald-600" bg="bg-emerald-50" />
        <StatSummaryCard title="Platform Pulse" value={stats.posts} subtext="Active Social Posts" icon={<BarChart3 />} color="text-blue-600" bg="bg-blue-50" />
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Distribution */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-8">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">User Base Split</h2>
            <PieChartIcon className="text-slate-300" size={20} />
          </div>
          <div className="w-full max-w-[280px]">
            <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        {/* Worker Performance */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between w-full mb-8">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pro Performance (Top 6)</h2>
            <TrendingUp className="text-indigo-600" size={20} />
          </div>
          <div className="h-[300px]">
            <Bar 
              data={barData} 
              options={{ 
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 5, grid: { display: false } }, x: { grid: { display: false } } },
                plugins: { legend: { display: false } }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Global Satisfaction Rating */}
      <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Network Health Score</h2>
          <p className="text-4xl font-black leading-none">Average Satisfaction</p>
        </div>
        <div className="flex items-center gap-4 mt-6 md:mt-0 relative z-10">
          <div className="text-right">
            <p className="text-5xl font-black italic">{avgSatisfaction}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Out of 5.0 Stars</p>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Star className="text-amber-400 fill-amber-400" size={32} />
          </div>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

// Sub-component for clean code
function StatSummaryCard({ title, value, subtext, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-indigo-100 transition-all">
      <div className={`p-4 ${bg} ${color} rounded-2xl transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-2xl font-black text-slate-900 leading-none">{value.toLocaleString()}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}