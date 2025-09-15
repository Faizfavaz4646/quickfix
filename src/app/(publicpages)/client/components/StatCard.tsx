"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { getClientProfile } from "@/services/workerService"; 
import { User } from "@/types/user";
import { FaTasks, FaClock, FaRunning, FaCheckCircle } from "react-icons/fa";

export default function StatsCard() {
  const user = useAuthStore((state) => state.user);
  const [client, setClient] = useState<User | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadClient = async () => {
      try {
        const data = await getClientProfile(user.id.toString());
        setClient(data);
      } catch (err) {
        console.error("Error fetching client profile:", err);
      }
    };

    loadClient();
  }, [user?.id]);

  if (!client?.profile) {
    return <p className="text-center text-gray-500">Loading stats...</p>;
  }

  const { requests = [], activeJobs = [], completedJobs = [] } = client.profile;

  const allRequests = requests.length + activeJobs.length + completedJobs.length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const ongoing = activeJobs.length;
  const completed = completedJobs.length;

  const stats = [
    { title: "All Requests", value: allRequests.toString(), icon: <FaTasks size={28} className="text-blue-500" /> },
    { title: "Pending", value: pending.toString(), icon: <FaClock size={28} className="text-yellow-500" /> },
    { title: "Ongoing", value: ongoing.toString(), icon: <FaRunning size={28} className="text-blue-400" /> },
    { title: "Completed", value: completed.toString(), icon: <FaCheckCircle size={28} className="text-green-500" /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center gap-3"
        >
          <div>{stat.icon}</div>
          <h3 className="text-lg font-semibold text-gray-700">{stat.title}</h3>
          <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
