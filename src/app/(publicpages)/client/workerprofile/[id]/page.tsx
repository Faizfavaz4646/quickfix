'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getWorkerProfile } from "@/services/clientService";
import PreviousWorks from "@/components/PreviousWorks";
import RequestDialog from "@/components/RequestDialog";
import { 
  MapPin, Phone, Mail, Calendar, 
  CheckCircle, ShieldCheck, Loader2, Briefcase 
} from "lucide-react";

export default function ProfilePage() {
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    getWorkerProfile(id as string)
      .then((data) => {
        setWorker(data);
      })
      .catch((err) => console.error("Error fetching profile:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const displayName = worker.name && worker.name !== "Worker" 
    ? worker.name 
    : (worker.userId?.name || "Service Provider");

  // ✅ 1. FIX: Calculate the correct User ID for the request
  // This handles if userId is a string OR an object
  const targetUserId = (typeof worker.userId === 'string') 
      ? worker.userId 
      : (worker.userId?._id || worker._id);

 const displayEmail = 
  worker.email || 
  worker.userId?.email || 
  worker.userId?.emailId || // 👈 Add this check
  "Contact Hidden";
  console.log("email:",displayEmail)
  
  const ratings = worker.ratings || [];
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((a:number, b:number) => a + b, 0) / ratings.length).toFixed(1) 
    : "New";
  const jobsCount = worker.completedJobs?.length || 0;
  
  const coverImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop";

  return (
    <section className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header / Cover Section */}
      <div 
        className="h-64 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-24">
        
        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Left: Avatar */}
            <div className="flex flex-col items-center md:items-start shrink-0 w-full md:w-auto">
              <div className="relative group">
                <img
                  src={worker.profilePic || "/images/avatar.avif"}
                  alt={displayName}
                  className="w-40 h-40 rounded-full object-cover border-[6px] border-white shadow-lg bg-slate-100"
                />
                <div className="absolute bottom-4 right-4 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
              </div>

              {/* 📱 MOBILE VIEW */}
              <div className="md:hidden text-center mt-4 w-full">
                 <h1 className="text-2xl font-black text-slate-800">{displayName}</h1>
                 <p className="text-blue-600 font-bold uppercase text-sm tracking-wide mt-1">{worker.profession}</p>
                 
                 <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-sm font-medium text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-red-500" />
                      {worker.city}, {worker.state}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-blue-500" />
                      2024
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-green-500" />
                      {worker.activeJobs?.length || 0} Active
                    </div>
                 </div>
              </div>
            </div>

            {/* Middle: Info (Desktop View) */}
            <div className="flex-1 w-full pt-2">
              <div className="hidden md:block">
                <div className="flex items-center justify-between">
                   <div>
                     <h1 className="text-4xl font-black text-slate-800 tracking-tight">{displayName}</h1>
                     
                     <div className="flex items-center gap-3 mt-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm shadow-blue-200">
                          {worker.profession || "Professional"}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                          <ShieldCheck size={14} className="text-green-600" /> Verified Pro
                        </span>
                     </div>
                   </div>
                   
                   {/* Key Stats */}
                   <div className="flex gap-8 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-2xl font-black text-slate-800">{avgRating}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</p>
                      </div>
                      <div className="w-px bg-slate-200"></div>
                      <div>
                        <p className="text-2xl font-black text-slate-800">{jobsCount}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jobs Done</p>
                      </div>
                   </div>
                </div>

                {/* Desktop Details Row */}
                <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-red-500" />
                    {worker.city}, {worker.state}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    Member since 2024
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-500" />
                    {worker.activeJobs?.length || 0} Active Jobs
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-8 pt-6 border-t border-slate-100 w-full">
                
                {/* ✅ 2. FIX: Use targetUserId here */}
                <RequestDialog 
                  workerId={targetUserId} 
                  workerName={displayName} 
                  workerPic={worker.profilePic} 
                />

              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* LEFT: Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Contact & Availability</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4 group">
                   <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                     <Phone size={18} />
                   </div>
                   <div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                     <p className="text-sm font-bold text-slate-800">{worker.phone}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                   <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                     <Mail size={18} />
                   </div>
                   <div className="min-w-0">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                     <p className="text-sm font-bold text-slate-800 truncate block w-40">{displayEmail}</p>
                   </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Work Schedule</p>
                  <div className="bg-green-50/50 text-green-800 text-sm font-bold px-4 py-3 rounded-xl border border-green-100 text-center">
                    {worker.schedule || "Mon - Sat : 9AM - 6PM"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {(worker.skills || [worker.profession, "Repair", "Maintenance"]).map((skill:string, i:number) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Portfolio */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                       <Briefcase size={20} className="text-blue-600" /> Portfolio Work
                    </h3>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                      {worker.previousWorkImages?.length || 0} Photos
                    </span>
                 </div>
                 {worker.previousWorkImages?.length > 0 ? (
                    <PreviousWorks 
                        images={worker.previousWorkImages} 
                        selected={selectedImg} 
                        setSelected={setSelectedImg} 
                        showAll={showAll} 
                        setShowAll={setShowAll} 
                    />
                 ) : (
                    <p className="text-slate-500 text-sm italic">No portfolio images uploaded.</p>
                 )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}