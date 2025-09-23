"use client";

import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { User } from "@/types/user";
import { FaUsers, FaBriefcase, FaCheckCircle, FaStar } from "react-icons/fa";
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
  fetchAllUsers,
  fetchAllWorkers,
  fetchActiveJobs,
  fetchCompletedJobs,
  fetchClientSatisfaction,
} from "@/services/adminService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [avgSatisfaction, setAvgSatisfaction] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const allUsers = await fetchAllUsers();
        const allWorkers = await fetchAllWorkers();
        const activeJobsData = await fetchActiveJobs();
        const completedJobsData = await fetchCompletedJobs();
        const satisfaction = await fetchClientSatisfaction();

        setUsers(allUsers);
        setWorkers(allWorkers);
        setActiveJobs(activeJobsData);
        setCompletedJobs(completedJobsData);
        setAvgSatisfaction(satisfaction ?? 0);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const totalUsers = users.length;
  const totalWorkers = workers.length;
  const totalClients = users.filter((u) => u.role === "client").length;

  const avgRatings = workers.map((w) => {
    const ratings = w.profile?.ratings ?? [];
    const avgRating = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : w.profile?.avgRating ?? 0;

    return {
      name: w.name ?? "Unknown",
      avgRating: Number(avgRating.toFixed(1)),
    };
  });

  const pieData = {
    labels: ["Workers", "Clients"],
    datasets: [
      {
        label: "Users",
        data: [totalWorkers, totalClients],
        backgroundColor: ["#3B82F6", "#F59E0B"],
      },
    ],
  };

  const barData = {
    labels: avgRatings.map((r) => r.name),
    datasets: [
      {
        label: "Avg Ratings",
        data: avgRatings.map((r) => r.avgRating),
        backgroundColor: "#10B981",
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6">Admin Analytics Dashboard</h1>

      {/* Summary Cards with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow rounded p-4 flex items-center gap-3">
          <FaUsers className="text-blue-500 w-6 h-6" />
          <div>
            <h2 className="text-gray-500">Total Users</h2>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 flex items-center gap-3">
          <FaBriefcase className="text-green-500 w-6 h-6" />
          <div>
            <h2 className="text-gray-500">Active Jobs</h2>
            <p className="text-2xl font-bold">{activeJobs.length}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 flex items-center gap-3">
          <FaCheckCircle className="text-purple-500 w-6 h-6" />
          <div>
            <h2 className="text-gray-500">Completed Jobs</h2>
            <p className="text-2xl font-bold">{completedJobs.length}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white shadow rounded p-5">
          <h2 className="font-bold mb-4">Users Distribution</h2>
          <Pie data={pieData} />
        </div>

        <div className="bg-white shadow rounded p-5">
          <h2 className="font-bold mb-4">Worker Average Ratings</h2>
          <Bar data={barData} />
        </div>
      </div>

      {/* Client Satisfaction with Star */}
      <div className="mt-10 bg-white shadow rounded p-5 flex items-center gap-3 justify-center">
        <FaStar className="text-yellow-400 w-6 h-6 -mt-10" />
        <div className="text-center">
          <h2 className="font-bold mb-2">Average Client Satisfaction</h2>
          <p className="text-xl font-semibold">{avgSatisfaction}/5</p>
        </div>
      </div>
    </div>
  );
}
