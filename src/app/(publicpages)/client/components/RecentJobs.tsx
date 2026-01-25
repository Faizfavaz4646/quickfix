"use client";

import { Job } from "@/types/user"; // Ensure this type exists or use 'any'
import { Calendar, Clock, CheckCircle, User, Star, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface RecentJobsProps {
  jobs: any[]; // Using 'any' to be safe with your backend data structure
  onRateClick: (job: any) => void; // Callback to open the modal
}

export default function RecentJobs({ jobs, onRateClick }: RecentJobsProps) {
  
  if (jobs.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center text-slate-400">
        <div className="bg-slate-50 p-4 rounded-full mb-3">
          <Clock className="w-8 h-8 text-slate-300" />
        </div>
        <p>No recent activity found.</p>
      </div>
    );
  }

  // Sort by date (newest first) and take top 5
  const displayJobs = [...jobs].sort((a, b) => 
    new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
  ).slice(0, 5);

  return (
    <div className="divide-y divide-slate-50">
      {displayJobs.map((job) => (
        <div key={job._id || job.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
          
          {/* Left: Job Details */}
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <div className={`p-2 rounded-full ${
                job.status === 'completed' ? 'bg-green-100 text-green-600' :
                job.status === 'ongoing' || job.status === 'accepted' ? 'bg-blue-100 text-blue-600' :
                'bg-yellow-100 text-yellow-600'
            }`}>
                {job.status === 'completed' ? <CheckCircle size={18} /> : 
                 job.status === 'ongoing' ? <Clock size={18} /> : <Calendar size={18} />}
            </div>

            <div>
                <h4 className="font-bold text-slate-800 text-sm">{job.title || "Job Request"}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                        <User size={12} /> {job.workerName || job.workerId?.name || "Pending Worker"}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar size={12} /> {job.date ? format(new Date(job.date), "MMM dd") : "N/A"}
                    </span>
                </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div>
            {job.status === 'completed' ? (
                // If completed and NOT rated yet (you'd need a field for this, otherwise show Rate)
                <button 
                  onClick={() => onRateClick(job)}
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 shadow-sm"
                >
                    <Star size={12} className="text-yellow-400 fill-yellow-400" /> Rate
                </button>
            ) : (
                <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                    job.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'
                }`}>
                    {job.status}
                </span>
            )}
          </div>

        </div>
      ))}
      
      {jobs.length > 5 && (
          <button className="w-full py-3 text-center text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1">
              View All History <ArrowRight size={12} />
          </button>
      )}
    </div>
  );
}