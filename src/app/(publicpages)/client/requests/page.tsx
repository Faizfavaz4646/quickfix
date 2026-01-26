"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuthStore } from "@/store/authStore";
import { getClientRequests } from "@/services/jobRequestHelper";
import ClientRequestCard from "../components/ClientRequestCard";
import RatingModal from "@/components/RatingModal"; // 👈 IMPORT THIS
import { Search, FolderOpen } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function RequestsContent() {
  const storeToken = useAuthStore((state: any) => state.token);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [token, setToken] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ RATING STATE
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // ... (Your useEffects for token, URL params, fetching data stay exactly the same) ...
  // (Copy-paste the useEffects from the previous answer if you need them)
  
  // Hydrate Token & Fetch Data (Shortened for brevity - keep your existing logic)
  useEffect(() => {
     if (typeof window !== "undefined") setToken(storeToken || localStorage.getItem("token"));
  }, [storeToken]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getClientRequests(token);
        setJobs(data);
      } catch (error) {
        console.error("Failed", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchJobs();
  }, [token]);


  // ✅ HANDLE RATE CLICK
  const handleRateClick = (job: any) => {
    setSelectedJob(job);
    setIsRatingOpen(true);
  };

  const handleRatingSuccess = () => {
    // Optional: Refresh list or mark locally as rated
    setIsRatingOpen(false);
  };

  // Filter Logic (Keep existing)
  const filteredJobs = jobs.filter((job) => {
    // ... (Keep your existing filter logic) ...
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesTab = true;
    if (activeTab === "pending") matchesTab = job.status === "pending";
    if (activeTab === "ongoing") matchesTab = job.status === "accepted" || job.status === "ongoing";
    if (activeTab === "completed") matchesTab = job.status === "completed" || job.status === "rejected";
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: "all", label: "All Requests" },
    { id: "pending", label: "Pending" },
    { id: "ongoing", label: "Ongoing" },
    { id: "completed", label: "History" },
  ];

  if (!token) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      
      {/* Header & Tabs (Keep existing UI) */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">My Requests</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
         {/* ... Tabs & Search Inputs (Keep existing) ... */}
         <div className="flex p-1 bg-slate-50 rounded-xl">
            {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => { setActiveTab(tab.id); router.push(`?tab=${tab.id}`, {scroll: false}) }}
                  className={`px-5 py-2 rounded-lg text-sm font-bold ${activeTab === tab.id ? 'bg-white shadow-sm' : 'text-slate-400'}`}
                >
                  {tab.label}
                </button>
            ))}
         </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">Loading...</div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <ClientRequestCard 
                key={job._id} 
                job={job} 
                onRate={handleRateClick} // 👈 PASS THE FUNCTION HERE
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">No requests found.</div>
      )}

      {/* ✅ RATING MODAL (Rendered conditionally) */}
      {selectedJob && (
        <RatingModal 
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          onSuccess={handleRatingSuccess}
          jobId={selectedJob._id}
          workerId={selectedJob.workerId?._id}
          workerName={selectedJob.workerId?.name}
          workerImage={selectedJob.workerId?.profilePic}
          token={token!}
        />
      )}

    </div>
  );
}

export default function ClientRequestsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RequestsContent />
    </Suspense>
  );
}