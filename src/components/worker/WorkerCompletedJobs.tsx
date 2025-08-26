"use client";

import { useAuthStore } from "@/store/authStore";
import { getWorkerProfile } from "@/services/workerService";
import { useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";

export default function CompletedJobs() {
  const completedJobs = useAuthStore((state) => state.completedJobs);
  const setCompletedJobs = useAuthStore((state) => state.setCompletedJobs);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchInitialJobs = async () => {
      if (!user?.id) return;

      try {
        const profile = await getWorkerProfile(user.id.toString());
        if (profile) {
          // Initialize Zustand state with existing completed jobs
          setCompletedJobs(profile.completedJobs ?? []);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchInitialJobs();
  }, [user, setCompletedJobs]);

  return (
    <div className="w-full h-32 rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg text-gray-800">Completed Jobs</h3>
        <FiCheckCircle className="text-green-500 w-6 h-6" />
      </div>

      <p className="mt-2 text-2xl font-bold text-green-600">{completedJobs.length}</p>
      <p className="text-sm text-gray-500">Total jobs completed</p>
    </div>
  );
}
