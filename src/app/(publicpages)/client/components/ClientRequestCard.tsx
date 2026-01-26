"use client";

import { Calendar, MapPin, Clock, Star } from "lucide-react";
import { format } from "date-fns";

interface RequestCardProps {
  job: any;
  onRate?: (job: any) => void; // 👈 New Prop
}

export default function ClientRequestCard({ job, onRate }: RequestCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "accepted": return "bg-purple-100 text-purple-700 border-purple-200";
      case "ongoing": return "bg-purple-100 text-purple-700 border-purple-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row gap-6 items-start md:items-center">
      
      {/* 1. Worker Image */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <img 
          src={job.workerId?.profilePic || "/images/avatar.avif"} 
          alt="Worker" 
          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm bg-slate-100"
        />
        <div>
          <h3 className="font-bold text-slate-900 line-clamp-1">{job.workerId?.name || "Unknown Worker"}</h3>
          <p className="text-xs text-slate-500 font-medium">{job.workerId?.profession || "Professional"}</p>
        </div>
      </div>

      {/* 2. Job Details */}
      <div className="flex-1 space-y-2 w-full">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-lg text-slate-800">{job.title}</h4>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{job.scheduledDate ? format(new Date(job.scheduledDate), "MMM dd, yyyy") : "No Date"}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span className="max-w-[150px] truncate">{job.address || "No Address"}</span>
          </div>
        </div>
      </div>

      {/* 3. ✅ ACTION BUTTONS */}
      <div className="flex flex-col items-end gap-2 min-w-[140px]">
        
        {/* Only show 'Rate' if status is completed */}
        {job.status === "completed" && (
          <button 
            onClick={() => onRate && onRate(job)} // 👈 Trigger Parent Function
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-blue-600 transition-all shadow-md shadow-slate-200"
          >
            <Star size={14} className="fill-white" />
            Rate Worker
          </button>
        )}

      </div>
    </div>
  );
}