"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getWorkerActiveJobs, updateRequestStatus } from "@/services/jobRequestHelper"; 
import { FiBriefcase } from "react-icons/fi";
import { toast } from "sonner";
import { Loader2, CheckCircle, MapPin, Phone, Calendar } from "lucide-react";
import { JobRequest } from "@/types/request";
import { format } from "date-fns";

export default function ActiveJobs() {
  const user = useAuthStore((state: any) => state.user);
  const token = useAuthStore((state: any) => state.token) || localStorage.getItem("token");

  // ✅ 1. Get Access to Completed Jobs Store
  const completedJobs = useAuthStore((state: any) => state.completedJobs) || [];
  const setCompletedJobs = useAuthStore((state: any) => state.setCompletedJobs);

  const [activeJobs, setActiveJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ✅ HELPER: Finds the image wherever it is hiding
  const getClientImage = (client: any) => {
    if (!client) return "/images/avatar.avif";
    if (client.profilePic && client.profilePic !== "") return client.profilePic;
    if (client.profile?.profilePic && client.profile.profilePic !== "") return client.profile.profilePic;
    return "/images/avatar.avif";
  };

  const fetchJobs = async () => {
    if (!token) {
        setLoading(false); 
        return;
    }
    try {
      const jobs = await getWorkerActiveJobs(token);
      setActiveJobs(jobs);
    } catch (error) {
      console.error("❌ API Fetch Failed:", error);
      toast.error("Could not load active jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token]);

  useEffect(() => {
    if (modalOpen) fetchJobs();
  }, [modalOpen]);

  // ✅ 2. HANDLE COMPLETION (Updated Logic)
  const handleCompleteJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      // A. Call Backend
      await updateRequestStatus(jobId, "completed", token!); 
      
      // B. Find the job we just finished
      const finishedJob = activeJobs.find(job => job._id === jobId);

      if (finishedJob) {
        // C. INSTANTLY update Global Store for "Completed Jobs"
        // This triggers the counter in CompletedJobs.tsx to jump up immediately!
        if (setCompletedJobs) {
            const updatedList = [...completedJobs, { ...finishedJob, status: "completed" }];
            setCompletedJobs(updatedList);
        }
      }

      toast.success("Job marked as completed! 🎉");
      
      // D. Remove from "Active" list locally
      setActiveJobs((prev) => prev.filter((job) => job._id !== jobId));
      
      if (activeJobs.length <= 1) setModalOpen(false);

    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  // --- RENDER ---
  if (loading && activeJobs.length === 0) {
    return (
      <div className="w-full h-32 rounded-xl p-4 mt-4 bg-white border border-gray-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="w-full h-32 rounded-xl p-5 mt-4 bg-white border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-800">Active Jobs</h3>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
             <FiBriefcase className="w-5 h-5" />
          </div>
        </div>
        
        <div>
           <p className="text-3xl font-black text-blue-600">{activeJobs.length}</p>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Currently in progress</p>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Active Jobs</h2>
                <p className="text-xs text-gray-500">Manage your ongoing work</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {activeJobs.length === 0 ? (
                <div className="text-center py-10">
                  <FiBriefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No active jobs right now.</p>
                  <p className="text-xs text-gray-400">Accept requests to see them here.</p>
                </div>
              ) : (
                activeJobs.map((job) => (
                  <div key={job._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all bg-white shadow-sm">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
                        <img 
                           src={getClientImage(job.clientId)} 
                           className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200" 
                           alt="Client" 
                           onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatar.avif"; }}
                        />
                        <div>
                            <p className="font-bold text-gray-800">{job.clientId?.name || "Client"}</p>
                            <p className="text-xs text-blue-600 font-bold uppercase">{job.title}</p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{job.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-500">
                             <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                <Calendar size={12} className="text-blue-500"/>
                                {job.scheduledDate ? format(new Date(job.scheduledDate), "MMM dd") : "Date N/A"}
                             </span>
                             <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                <Phone size={12} className="text-green-500"/>
                                {job.clientPhone}
                             </span>
                        </div>
                    </div>

                    <button
                      onClick={() => handleCompleteJob(job._id)}
                      disabled={actionLoading === job._id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-green-200 shadow-md disabled:opacity-70"
                    >
                      {actionLoading === job._id ? <Loader2 className="animate-spin w-4 h-4"/> : <CheckCircle className="w-4 h-4" />}
                      Mark as Completed
                    </button>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}