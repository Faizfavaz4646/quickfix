"use client";

import { useEffect, useState } from "react";
import {
  fetchAllUsers,
  fetchAllWorkers,
  fetchAllClients,
  fetchActiveJobs,
  fetchClientSatisfaction,
} from "@/services/adminService";

import { FaUsers, FaUserTie } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import { MdOutlineStar } from "react-icons/md";

interface CardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  iconBg: string;
}

const StatCard = ({ title, value, change, icon, iconBg }: CardProps) => (
  <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow hover:shadow-lg transition mb-4">
    <div>
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {change && (
        <p
          className={`text-sm ${
            change.startsWith("-") ? "text-red-500" : "text-green-600"
          }`}
        >
          {change}
        </p>
      )}
    </div>
    <div className={`p-3 rounded-full ${iconBg} text-white text-xl`}>
      {icon}
    </div>
  </div>
);

export default function DashboardCards() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [clientSatisfaction, setClientSatisfaction] = useState<number | null>(
    null
  );

  useEffect(() => {
    const loadData = async () => {
      const users = await fetchAllUsers();
      setTotalUsers(users.length);

      const workers = await fetchAllWorkers();
      setTotalWorkers(workers.length);

      const clients = await fetchAllClients();
      setTotalClients(clients.length);

      const jobs = await fetchActiveJobs();
      setActiveJobs(jobs.length);

     const avgRating = await fetchClientSatisfaction();
    setClientSatisfaction(avgRating);
    };

    loadData();
  }, []); // ✅ Added dependency array

  return (
    <div className="flex flex-col mt-6">
      <StatCard
        title="Total Users"
        value={totalUsers}
        change="+12% from last month"
        icon={<FaUsers />}
        iconBg="bg-blue-500"
      />
      <StatCard
        title="Total Workers"
        value={totalWorkers}
        change="+8% from last month"
        icon={<FaUserTie />}
        iconBg="bg-green-500"
      />
      <StatCard
        title="Active Jobs"
        value={activeJobs}
        change="-3% from last month"
        icon={<RiShoppingCartLine />}
        iconBg="bg-purple-500"
      />
      <StatCard
        title="Client Satisfaction"
        value={clientSatisfaction ? `${clientSatisfaction}/5` : "N/A"}
        change="+5% from last month"
        icon={<MdOutlineStar />}
        iconBg="bg-yellow-500"
      />
    </div>
  );
}
