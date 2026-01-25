"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getWorkerCompletedJobs } from "@/services/jobRequestHelper"; 
import { FiCheckCircle } from "react-icons/fi";

export default function CompletedJobs() {
  // 1. Get Token & Refresh Signal from Store
  const storeToken = useAuthStore((state: any) => state.token);
  const refreshTrigger = useAuthStore((state: any) => state.refreshTrigger);

  // 2. Local State (Since we removed it from the global store)
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted) return;

    const token = storeToken || localStorage.getItem("token");
    if (!token) return;

    const fetchJobs = async () => {
      try {
        const jobs = await getWorkerCompletedJobs(token);
        if (jobs && Array.isArray(jobs)) {
          // ✅ Update LOCAL state, not global store
          setCompletedJobs(jobs);
        }
      } catch (error) {
        console.error("Error syncing completed jobs:", error);
      }
    };

    fetchJobs();

    // 🔄 Re-run whenever 'refreshTrigger' changes (when a job is completed)
  }, [isMounted, storeToken, refreshTrigger]); 

  if (!isMounted) {
    return <div className="w-full h-32 rounded-lg bg-gray-50 animate-pulse mt-4 border border-gray-100" />;
  }

  return (
    <div className="w-full h-32 rounded-xl p-5 mt-4 bg-white border border-gray-100 hover:shadow-md hover:border-green-200 transition-all flex flex-col justify-between group">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-gray-800">Completed Jobs</h3>
        <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
            <FiCheckCircle className="w-5 h-5" />
        </div>
      </div>

      <div>
        <p className="mt-2 text-3xl font-black text-green-600">
            {completedJobs.length}
        </p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Total jobs completed
        </p>
      </div>
    </div>
  );
}