"use client";

import { useAuthStore } from "@/store/authStore";
import { JobRequest } from "@/types/request";
import { useEffect, useState } from "react";
import { getWorkerRequests, updateRequestStatus } from "../../services/jobRequestHelper";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function NewRequests() {
  // 1. Get hasHydrated to prevent race conditions
  const { user, hasHydrated } = useAuthStore();
  
  // Safe token access
  const token = (user as any)?.token || (useAuthStore.getState() as any).token;

  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // 2. Only fetch if store is hydrated AND we have a token
    if (hasHydrated && token) {
      fetchRequests();
    } else if (hasHydrated && !token) {
      setLoading(false); // Stop loading if no user is logged in
    }
  }, [hasHydrated, token]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getWorkerRequests(token);
      console.log("✅ [COMPONENT] Data Received:", data);
      setRequests(data);
    } catch (err) {
      console.error("❌ [COMPONENT] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: "accepted" | "rejected") => {
    if (!token) return;
    setActionLoading(requestId);
    
    const success = await updateRequestStatus(requestId, status, token);
    
    if (success) {
      toast.success(`Request ${status} successfully`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    }
    setActionLoading(null);
  };

  // 3. Show loading state while waiting for hydration
  if (!hasHydrated || loading) {
    return (
      <div className="w-full h-64 rounded-xl p-4 mt-4 bg-white border border-gray-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] bg-white border border-gray-100 rounded-xl p-5 mt-4 hover:shadow-md transition-shadow duration-300 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-gray-800">New Requests</h3>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {requests.length}
          </span>
        </div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req._id}
              className="group border border-gray-100 p-4 rounded-xl bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                    {req.clientId?.name?.[0] || "C"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{req.clientId?.name || "Client"}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {req.createdAt ? formatDistanceToNow(new Date(req.createdAt), { addSuffix: true }) : "Recent"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {req.description || "No description provided."}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusUpdate(req._id, "accepted")}
                  disabled={actionLoading === req._id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading === req._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Accept
                </button>
                <button
                  onClick={() => handleStatusUpdate(req._id, "rejected")}
                  disabled={actionLoading === req._id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
              <Clock className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No new requests</p>
            <p className="text-xs text-gray-400">Wait for clients to hire you</p>
          </div>
        )}
      </div>
    </div>
  );
}