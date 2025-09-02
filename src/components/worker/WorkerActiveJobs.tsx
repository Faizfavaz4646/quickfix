"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getWorkerProfile, markJobCompleted, acceptRequest } from "@/services/workerService";
import { FiBriefcase } from "react-icons/fi";
import { toast } from "sonner";

export default function ActiveJobs() {
  const user = useAuthStore((state) => state.user);
  const activeJobs = useAuthStore((state) => state.activeJobs);
  const completedJobs = useAuthStore((state) => state.completedJobs);
  const setActiveJobs = useAuthStore((state) => state.setActiveJobs);
  const setCompletedJobs = useAuthStore((state) => state.setCompletedJobs);
  const markJobCompletedLocally = useAuthStore((state) => state.markJobCompletedLocally);
  const addNewActiveJob = useAuthStore((state) => state.addActiveJob);

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from backend json
  useEffect(() => {
    if (!user?.id) return;

    const fetchJobs = async () => {
      try {
        const profile = await getWorkerProfile(user.id.toString());
        if (profile) {
          // Ensure unique IDs (React needs it for lists)
          const uniqueActiveJobs = (profile.activeJobs ?? []).map((j, idx) => ({
            ...j,
            key: j.id ?? `active-${idx}-${Date.now()}`,
          }));

          const uniqueCompletedJobs = (profile.completedJobs ?? []).map((j, idx) => ({
            ...j,
            key: j.id ?? `completed-${idx}-${Date.now()}`,
          }));

          setActiveJobs(uniqueActiveJobs);
          setCompletedJobs(uniqueCompletedJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, setActiveJobs, setCompletedJobs]);

  // Complete job
  const handleCompleteJob = async (jobId: number) => {
    if (!user?.id) return;

    markJobCompletedLocally(jobId);

    try {
      await markJobCompleted(user.id.toString(), jobId);
      toast.success("Job marked as completed ✅");
    } catch (error) {
      console.error("Error completing job:", error);
      toast.error("Failed to complete job ❌");
    }
  };

  // Accept request
  const handleAcceptRequest = async (request: any) => {
    if (!user?.id) return;

    const newJob = {
      id: request.id,
      clientId: request.clientId,
      name: request.name,
      description: request.description,
      status: "ongoing" as const,
      key: request.id ?? `new-${Date.now()}`, // unique key
    };

    addNewActiveJob(newJob);

    try {
      await acceptRequest(user.id.toString(), request.id);
      toast.success("Request accepted! ✅");
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request ❌");
    }
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto relative">
            <h2 className="text-xl font-bold mb-4">Active Jobs</h2>

            {activeJobs.length === 0 ? (
              <p>No active jobs.</p>
            ) : (
              activeJobs.map((job,idx) => (
                <div key={job.id ?? `-${idx}`} className="border p-3 rounded mb-3">
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

            {user?.profile?.requests?.length ? (
  <>
    <h3 className="text-lg font-semibold mt-4 mb-2">Pending Requests</h3>
    {user.profile.requests.map((req, idx) => (
      <div key={req.id ?? `req-${idx}-${Date.now()}`} className="border p-3 rounded mb-3">
        <p className="font-semibold">{req.name}</p>
        <p className="text-gray-600">{req.description}</p>
        <button
          onClick={() => handleAcceptRequest(req)}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Accept Request
        </button>
      </div>
    ))}
  </>
) : null
}

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
