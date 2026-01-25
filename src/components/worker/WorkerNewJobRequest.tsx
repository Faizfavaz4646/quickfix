"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getWorkerRequests, updateRequestStatus } from "@/services/jobRequestHelper";
import { JobRequest } from "@/types/request";
import { CheckCircle, XCircle, Clock, Loader2, BellRing, MapPin } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function NewRequests() {
  const storeToken = useAuthStore((state: any) => state.token);
  
  // Local State
  const [token, setToken] = useState<string | null>(null);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // 1. Safe Hydration
  useEffect(() => {
    setMounted(true);
    const localToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(storeToken || localToken);
  }, [storeToken]);

  // 2. Fetch Data
  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch from API
        const data = await getWorkerRequests(token);
        
        // 🛡️ SAFETY: Filter specifically for 'pending' requests.
        // This ensures the widget is correct even if the API returns history.
        const pendingRequests = Array.isArray(data) 
          ? data.filter(r => r.status === 'pending') 
          : [];
          
        setRequests(pendingRequests);
      } catch (error) {
        console.error("Failed to load new requests");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, mounted]);

  // 3. Handle Actions
  const handleAction = async (id: string, status: "accepted" | "rejected") => {
    if (!token) return;
    setActionLoading(id);

    try {
      const success = await updateRequestStatus(id, status, token);
      if (success) {
        toast.success(status === "accepted" ? "Job Accepted! 🎉" : "Job Declined");
        // Remove from list immediately
        setRequests((prev) => prev.filter((r) => r._id !== id));
        
        // Optional: Trigger a global refresh if you have that setup
        // useAuthStore.getState().triggerRefresh(); 
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Loading State
  if (!mounted || loading) {
    return (
      <div className="w-full h-80 bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-100 rounded mb-2"></div>
        <div className="flex-1 bg-gray-50 rounded-lg"></div>
        <div className="flex-1 bg-gray-50 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl p-5 mt-4 hover:shadow-lg transition-all duration-300 flex flex-col h-[420px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <BellRing size={18} />
          </div>
          <h3 className="font-bold text-lg text-gray-800">New Requests</h3>
        </div>
        {requests.length > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {requests.length} NEW
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req._id}
              className="border border-gray-100 p-4 rounded-xl bg-white shadow-sm hover:border-blue-300 transition-all"
            >
              {/* Top Row: Client Info */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={req.clientId?.profilePic || "/images/avatar.avif"}
                    alt="Client"
                    className="w-9 h-9 rounded-full object-cover border border-gray-100 bg-gray-50"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatar.avif"; }}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                        {req.clientId?.name || "Client"}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium mt-0.5">
                      <Clock size={10} />
                      {req.createdAt ? formatDistanceToNow(new Date(req.createdAt), { addSuffix: true }) : "Just now"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                 <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">{req.title}</h4>
                 <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {req.description || "No description provided."}
                 </p>
                 <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={12} />
                    <span className="truncate max-w-[200px]">{req.address}</span>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(req._id, "accepted")}
                  disabled={actionLoading === req._id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-70"
                >
                  {actionLoading === req._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Accept
                </button>
                <button
                  onClick={() => handleAction(req._id, "rejected")}
                  disabled={actionLoading === req._id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-bold rounded-lg transition-all disabled:opacity-70"
                >
                  <XCircle className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-70">
            <div className="bg-gray-50 p-3 rounded-full mb-3">
              <CheckCircle className="w-8 h-8 text-green-500/50" />
            </div>
            <p className="text-sm font-bold text-gray-600">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">No pending requests at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}