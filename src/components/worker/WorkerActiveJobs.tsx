"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getWorkerActiveJobs, updateRequestStatus } from "@/services/jobRequestHelper"; 
import { FiBriefcase } from "react-icons/fi";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // 1. IMPORT ROUTER
import { Loader2, CheckCircle, Phone, Calendar, Video } from "lucide-react"; // 2. IMPORT VIDEO ICON
import { JobRequest } from "@/types/request";
import { format } from "date-fns";

export default function ActiveJobs() {
  const router = useRouter(); // 3. INITIALIZE ROUTER
  
  // 4. GET USER (We need the Worker's ID to generate the Room ID)
  const { token: storeToken, user, triggerRefresh } = useAuthStore((state: any) => state);

  const [token, setToken] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Hydrate Token
  useEffect(() => {
    const localToken = localStorage.getItem("token");
    setToken(storeToken || localToken);
  }, [storeToken]);

  const fetchJobs = async () => {
    if (!token) return;
    try {
      const jobs = await getWorkerActiveJobs(token);
      setActiveJobs(jobs);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchJobs();
    else {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [token]);

  useEffect(() => { if (modalOpen) fetchJobs(); }, [modalOpen]);

  const getClientImage = (client: any) => {
    if (!client) return "/images/avatar.avif";
    if (client.profilePic) return client.profilePic;
    if (client.profile?.profilePic) return client.profile.profilePic;
    return "/images/avatar.avif";
  };

  // --- 🎥 5. VIDEO CALL FUNCTION ---
  const handleCallClient = (client: any) => {
    if (!user?._id || !client?._id) {
       toast.error("Cannot start call: Missing user info");
       return;
    }

    // Sort IDs so this Room ID matches the Client's Room ID exactly
    const ids = [user._id, client._id].sort(); 
    const roomId = `call-${ids[0]}-${ids[1]}`;

    // Redirect to the call page
    router.push(`/call/${roomId}`);
  };
  // --------------------------------

  const handleCompleteJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      await updateRequestStatus(jobId, "completed", token!); 
      setActiveJobs((prev) => prev.filter((job) => job._id !== jobId));
      if (triggerRefresh) triggerRefresh();
      toast.success("Job completed! 🎉");
      if (activeJobs.length <= 1) setModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

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
                </div>
              ) : (
                activeJobs.map((job) => (
                  <div key={job._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all bg-white shadow-sm">
                    
                    {/* Header with Client Info & Video Button */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
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

                        {/* 6. CALL BUTTON ADDED HERE */}
                        <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             handleCallClient(job.clientId);
                           }}
                           className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors"
                        >
                           <Video size={14} />
                           Call
                        </button>
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