"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getWorkerProfile, markJobCompleted } from "@/services/workerService";
import { FiBriefcase } from "react-icons/fi";

export default function ActiveJobs() {
  const user = useAuthStore((state) => state.user);
  const activeJobs = useAuthStore((state) => state.activeJobs);
  const completedJobs = useAuthStore((state) => state.completedJobs);
  const setActiveJobs = useAuthStore((state) => state.setActiveJobs);
  const setCompletedJobs = useAuthStore((state) => state.setCompletedJobs);
  const markJobCompletedLocally = useAuthStore(
    (state) => state.markJobCompletedLocally
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from backend on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchJobs = async () => {
      try {
        const profile = await getWorkerProfile(user.id.toString());
        if (profile) {
          // Sync Zustand store with backend
          setActiveJobs(profile.activeJobs ?? []);
          setCompletedJobs(profile.completedJobs ?? []);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, setActiveJobs, setCompletedJobs]);

  // Handle completing a job
  const handleCompleteJob = async (jobId: number) => {
    if (!user?.id) return;

    // Instant UI update
    markJobCompletedLocally(jobId);

    try {
      await markJobCompleted(user.id.toString(), jobId);
    } catch (error) {
      console.error("Error completing job:", error);
    }
  };

  // Optional: handle accepting a request
  const addNewActiveJob = useAuthStore((state) => state.addActiveJob);
  const handleAcceptRequest = (request: any) => {
    // Convert request → job
    const newJob = {
      id: request.id,
      clientId: request.clientId,
      name: request.name,
      description: request.description,
      status: "ongoing" as const,
    };

    // Instant UI update
    addNewActiveJob(newJob);

    // Call backend API here (axios.post etc.)
  };

  if (loading) {
    return (
      <div className="w-auto h-32 rounded-lg p-4 mt-4 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* Active Jobs Card */}
      <div
        onClick={() => setModalOpen(true)}
        className="w-auto h-32 rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out flex flex-col cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-800">Active Jobs</h3>
          <FiBriefcase className="text-blue-500 w-6 h-6" />
        </div>

        <p className="mt-2 text-2xl font-bold text-blue-600">{activeJobs.length}</p>
        <p className="text-sm text-gray-500">Currently in progress</p>
      </div>

      {/* Active Jobs Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto relative">
            <h2 className="text-xl font-bold mb-4">Active Jobs</h2>

            {activeJobs.length === 0 ? (
              <p>No active jobs.</p>
            ) : (
              activeJobs.map((job) => (
                <div key={job.id} className="border p-3 rounded mb-3">
                  <p className="font-semibold">{job.name}</p>
                  <p className="text-gray-600">{job.description}</p>
                  <button
                    onClick={() => handleCompleteJob(job.id)}
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Mark as Completed
                  </button>
                </div>
              ))
            )}

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
