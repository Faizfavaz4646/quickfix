"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getWorkerRequests, updateRequestStatus } from "@/services/jobRequestHelper"; // Reuse your existing service
import { JobRequest } from "@/types/request"; // Ensure you have this type
import { toast } from "sonner";
import { 
  Calendar, MapPin, Phone, Clock, 
  CheckCircle, XCircle, Filter, Search 
} from "lucide-react";
import { format } from "date-fns";

export default function WorkerRequestsPage() {
  const { user } = useAuthStore();
  const token = (user as any)?.token;

  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // You might need to update your API to get ALL requests, not just pending
      // Or filter client-side if the API returns everything
      const data = await getWorkerRequests(token); 
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: "accepted" | "rejected") => {
    setProcessingId(id);
    try {
      const success = await updateRequestStatus(id, status, token);
      if (success) {
        toast.success(`Request ${status} successfully`);
        // Remove from list or refresh data
        setRequests(prev => prev.filter(r => r._id !== id));
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Filter based on Tab
  const displayedRequests = requests.filter(req => 
    activeTab === "pending" 
      ? req.status === "pending"
      : req.status !== "pending"
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Job Requests</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your incoming work and history.</p>
          </div>
          
          {/* Tabs */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "pending" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Pending ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "history" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          {loading ? (
             <p className="text-center py-10 text-slate-400">Loading requests...</p>
          ) : displayedRequests.length === 0 ? (
             <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No {activeTab} requests found.</p>
             </div>
          ) : (
            displayedRequests.map((req) => (
              <div 
                key={req._id} 
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6"
              >
                {/* Left: Date & Status */}
                <div className="md:w-48 shrink-0 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Scheduled For</span>
                   <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      {req.scheduledDate ? format(new Date(req.scheduledDate), "MMM dd, yyyy") : "ASAP"}
                   </div>
                   <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mt-1">
                      <Clock className="w-4 h-4" />
                      {req.scheduledDate ? format(new Date(req.scheduledDate), "h:mm a") : "Flexible"}
                   </div>
                </div>

                {/* Middle: Details */}
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <img 
                        src={req.clientId?.profilePic || "/images/avatar.avif"} 
                        alt="Client"
                        className="w-8 h-8 rounded-full bg-slate-100 object-cover" 
                      />
                      <span className="text-sm font-bold text-slate-700">{req.clientId?.name || "Client"}</span>
                   </div>
                   
                   <h3 className="text-xl font-bold text-slate-800 mb-2">{req.title}</h3>
                   <p className="text-slate-600 text-sm leading-relaxed mb-4">{req.description}</p>
                   
                   <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <MapPin size={14} className="text-red-500" />
                        {req.address}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Phone size={14} className="text-green-500" />
                        {req.clientPhone}
                      </span>
                   </div>
                </div>

                {/* Right: Actions (Only for Pending) */}
                {activeTab === "pending" && (
                  <div className="flex flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                    <button
                      onClick={() => handleAction(req._id, "accepted")}
                      disabled={!!processingId}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
                    >
                      <CheckCircle size={16} /> Accept
                    </button>
                    <button
                      onClick={() => handleAction(req._id, "rejected")}
                      disabled={!!processingId}
                      className="flex-1 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <XCircle size={16} /> Decline
                    </button>
                  </div>
                )}
                
                {/* Status Badge (For History) */}
                {activeTab === "history" && (
                    <div className="flex flex-col justify-center items-center md:items-end md:pl-6 min-w-[140px]">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                            req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {req.status}
                        </span>
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}