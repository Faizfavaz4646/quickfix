"use client";

import { useEffect, useState } from "react";
import { useAuthStore, Profile } from "@/types/user";
import { getWorkerProfile } from "@/services/workerService";

export default function ActiveJobs() {
  const { user } = useAuthStore();
  const [activeJobCount, setActiveJobCount] = useState(0);

  useEffect(() => {
    const fetchActiveJobs = async () => {
      if (!user?.id) return;
      try {
        const profile: Profile | null = await getWorkerProfile(user.id.toString());
        if (profile?.activeJobs) {
          setActiveJobCount(profile.activeJobs.length);
        }
      } catch (error) {
        console.error("Error fetching active jobs:", error);
      }
    };

    fetchActiveJobs();
  }, [user]);

  return (
    <div className="border border-gray-200 w-auto h-32 shadow-md rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out">
      <h3 className="font-semibold text-lg text-gray-800">Active Jobs</h3>

      <p className="mt-2 text-2xl font-bold text-blue-600">
        {activeJobCount}
      </p>

      <p className="text-sm text-gray-500">Currently in progress</p>
    </div>
  );
}
