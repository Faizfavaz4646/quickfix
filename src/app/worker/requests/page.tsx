"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getWorkerRequests, updateRequestStatus } from "@/services/jobRequestHelper";
import { JobRequest } from "@/types/request"; 
import { toast } from "sonner";
import { Calendar, MapPin, Phone, CheckCircle, XCircle, Filter } from "lucide-react";
import { format } from "date-fns";

export default function WorkerRequestsPage() {
  // ✅ FIX: Select 'token' directly from the store, not inside 'user'
  const storeToken = useAuthStore((state: any) => state.token);
  
  // Also getting hydration status if available in your store, otherwise we rely on useEffect
  const [token, setToken] = useState<string | null>(null);
  
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Hydrate Token Correctly
  useEffect(() => {
    // Priority 1: Get from Zustand Store (Active Memory)
    if (storeToken) {
        console.log("🔑 [DEBUG] Found Token in Store");
        setToken(storeToken);
        return;
    }

    // Priority 2: Get from LocalStorage manually (Backup)
    // We parse "quickfix-user" because that's where Zustand saves it
    if (typeof window !== "undefined") {
        const storage = localStorage.getItem("quickfix-user");
        if (storage) {
            try {
                const parsed = JSON.parse(storage);
                const savedToken = parsed.state?.token;
                if (savedToken) {
                    console.log("🔑 [DEBUG] Found Token in LocalStorage JSON");
                    setToken(savedToken);
                    // Optional: Sync back to store if needed
                    // useAuthStore.setState({ token: savedToken }); 
                }
            } catch (e) {
                console.error("Error parsing local storage", e);
            }
        }
    }
  }, [storeToken]);

  // 2. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      setLoading(true);
      try {
        console.log("📡 [DEBUG] Fetching with token:", token.substring(0, 10) + "...");
        const data = await getWorkerRequests(token); 
        
        console.log("📦 [DEBUG] API Response Items:", data.length);
        setRequests(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
        fetchData();
    } else {
        // Only stop loading if we are sure there is no token (give hydration a moment)
        const timer = setTimeout(() => {
            if (!token) setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [token]);

  const handleAction = async (id: string, status: "accepted" | "rejected") => {
    setProcessingId(id);
    try {
      const success = await updateRequestStatus(id, status, token!);
      if (success) {
        toast.success(`Request ${status} successfully`);
        setRequests(prev => prev.map(req => 
            req._id === id ? { ...req, status } : req
        ));
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Filter based on Tab
  const displayedRequests = requests.filter(req => 
    activeTab === "pending" 
      ? req.status === "pending"
      : ["accepted", "rejected", "completed"].includes(req.status)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Requests</h1>
            <p className="text-slate-500 text-sm mt-1">Manage incoming work and view history.</p>
          </div>
          
          {/* Tabs */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "pending" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Pending <span className="ml-2 bg-slate-700 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.filter(r => r.status === 'pending').length}</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "history" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-5">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium">Loading requests...</p>
             </div>
          ) : displayedRequests.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg">No {activeTab} requests</h3>
                <p className="text-slate-400 text-sm mt-1">
                    {activeTab === 'pending' ? "You're all caught up!" : "No past jobs found."}
                </p>
                {/* Debug Info */}
                <p className="text-[10px] text-gray-300 mt-4">
                   Debug: {requests.length} items loaded. Token: {token ? "Valid" : "Missing"}
                </p>
             </div>
          ) : (
            displayedRequests.map((req) => (
              <div key={req._id} className="group bg-white rounded-2xl p-0 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
                <div className={`h-2 md:h-auto md:w-2 shrink-0 ${
                    req.status === 'pending' ? 'bg-yellow-400' :
                    req.status === 'accepted' ? 'bg-green-500' :
                    req.status === 'rejected' ? 'bg-red-400' : 'bg-slate-300'
                }`} />

                <div className="p-6 md:p-8 flex-1 flex flex-col md:flex-row gap-6">
                    <div className="md:w-40 shrink-0 flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1 md:border-r border-slate-100 md:pr-6">
                       <div className="bg-slate-100 text-slate-600 rounded-lg p-2.5 md:mb-2">
                           <Calendar className="w-6 h-6" />
                       </div>
                       <div>
                           <div className="text-slate-900 font-bold text-lg leading-tight">
                              {req.scheduledDate ? format(new Date(req.scheduledDate), "MMM dd") : "ASAP"}
                           </div>
                           <div className="text-slate-400 text-xs font-bold uppercase tracking-wide mt-1">
                              {req.scheduledDate ? format(new Date(req.scheduledDate), "h:mm a") : "Flexible"}
                           </div>
                       </div>
                    </div>

                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-3">
                          <img 
                              src={req.clientId?.profilePic || "/images/avatar.avif"} 
                              alt="Client"
                              className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-100" 
                              onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatar.avif"; }}
                          />
                          <div>
                              <p className="text-sm font-bold text-slate-800 leading-none">{req.clientId?.name || "Client Name"}</p>
                              <p className="text-xs text-slate-400 font-medium mt-1 truncate max-w-[150px]">{req.clientId?.email || "No email"}</p>
                          </div>
                       </div>
                       
                       <h3 className="text-xl font-bold text-slate-900 mb-2">{req.title}</h3>
                       <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-2">{req.description}</p>
                       
                       <div className="flex flex-wrap gap-3">
                          <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-xs font-bold text-slate-500">
                            <MapPin size={14} className="text-slate-400" />
                            {req.address}
                          </span>
                          <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-xs font-bold text-slate-500">
                            <Phone size={14} className="text-slate-400" />
                            {req.clientPhone}
                          </span>
                       </div>
                    </div>

                    <div className="md:w-48 shrink-0 flex flex-col justify-center gap-3 md:pl-6 md:border-l border-slate-100">
                        {activeTab === "pending" ? (
                            <>
                                <button onClick={() => handleAction(req._id, "accepted")} disabled={!!processingId} className="w-full bg-slate-900 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-70">
                                <CheckCircle size={16} /> Accept Job
                                </button>
                                <button onClick={() => handleAction(req._id, "rejected")} disabled={!!processingId} className="w-full bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                                <XCircle size={16} /> Decline
                                </button>
                            </>
                        ) : (
                            <div className="text-center">
                                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                                    req.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    req.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                    {req.status}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}