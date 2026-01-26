"use client";

import { useState } from "react";
import { MdOutlineVerifiedUser, MdOutlineAccessTime } from "react-icons/md";
import { AiFillStar } from "react-icons/ai";
import { FaArrowLeft, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa"; 
import Link from "next/link";
import Image from "next/image";
import { searchWorkers } from "@/services/clientService"; 

// Helper: Render stars based on numeric rating
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex text-yellow-400 text-sm gap-0.5">
      {Array(fullStars).fill(0).map((_, i) => <AiFillStar key={`full-${i}`} />)}
      {halfStar && <AiFillStar key="half" className="text-yellow-400/50" />}
      {Array(emptyStars).fill(0).map((_, i) => (
        <AiFillStar key={`empty-${i}`} className="text-gray-300" />
      ))}
    </div>
  );
};

export default function FindWorker() {
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!profession && !location) return;

    setLoading(true);
    try {
      const results = await searchWorkers(profession, location);
      setSearchResult(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching workers", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen overflow-x-hidden pb-10">
      
      {/* Navigation */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white bg-black/30 backdrop-blur-md px-4 py-2 rounded-full hover:bg-black/50 transition-all shadow-lg font-medium text-sm border border-white/10"
      >
        <FaArrowLeft /> Back Home
      </Link>

      {/* Hero Background */}
      <Image
        src="/images/cleaning.jpg"
        alt="Worker background"
        fill
        className="object-cover opacity-70"
        priority
      />

      <div className="absolute inset-0 flex flex-col items-center text-center px-4">
        
        {/* Title Section */}
        <div className="mb-8 mt-28 sm:mt-32 lg:mt-40">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white drop-shadow-lg leading-snug">
            <span className="text-blue-400">Find</span> Trusted Service{" "}
            <span className="text-blue-400">Professionals</span>
          </h1>
          <p className="text-white text-sm sm:text-base mt-3 drop-shadow-md max-w-lg mx-auto font-medium opacity-90">
            Connect with verified experts in your area
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-4xl p-2 sm:p-4 flex flex-col sm:flex-row gap-3 mb-8 border border-white/50">
          <div className="flex-1 relative">
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full h-14 pl-4 pr-10 rounded-xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">Select Profession</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Painter">Painter</option>
              <option value="Mechanic">Mechanic</option>
              <option value="HVAC Technician">HVAC Technician</option>
            </select>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter City (e.g. Kerala)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-14 px-4 rounded-xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="h-14 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 text-white mb-10 text-sm font-medium">
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <MdOutlineVerifiedUser size={18} className="text-blue-400" />
            <span>Verified Pros</span>
          </div>
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <AiFillStar size={18} className="text-yellow-400" />
            <span>Real User Ratings</span>
          </div>
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <MdOutlineAccessTime size={18} className="text-green-400" />
            <span>Fast Booking</span>
          </div>
        </div>

        {/* --- RESULTS GRID --- */}
        {showResults && (
          <div className="w-full max-w-3xl space-y-4 pb-20">
            {searchResult.length > 0 ? (
              <div className="space-y-3">
                {searchResult.map((worker, index) => {
                  
                  // Read backend calculated fields
                  const averageRating = worker.averageRating || 0;
                  const reviewCount = worker.totalReviews || 0;
                  const profilePic = worker.finalProfilePic || "/images/avatar.avif";
                  const name = worker.name || "Service Professional";
                  const jobsDone = worker.jobsDone || 0;

                  return (
                    <Link
                      key={worker._id || index}
                      href={`/client/workerprofile/${worker.userId}`} 
                      className="block group"
                    >
                      <div className="bg-white p-5 rounded-2xl shadow-lg border border-transparent hover:border-blue-400 hover:shadow-2xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-5">
                        
                        {/* Avatar */}
                        <div className="relative w-16 h-16 shrink-0">
                          <Image
                            src={profilePic}
                            alt={name}
                            fill
                            className="rounded-full object-cover border-2 border-slate-100 group-hover:border-blue-100 transition-colors"
                          />
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-center sm:text-left min-w-0">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                            {name}
                          </h3>
                          
                          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                            {renderStars(averageRating)}
                            <span className="text-xs font-semibold text-slate-400">
                              ({reviewCount} reviews)
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            {jobsDone} jobs completed successfully
                          </p>
                        </div>

                        {/* Badge */}
                        <div className="flex flex-col items-center sm:items-end gap-2 min-w-[120px]">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide rounded-full">
                            <FaBriefcase size={10} />
                            {worker.profession}
                          </span>
                          
                          <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                            <FaMapMarkerAlt size={12} className="text-red-400" />
                            {worker.city || worker.district || "Location N/A"}
                          </div>
                        </div>

                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              // Empty State
              <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl text-center border border-white/50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdOutlineAccessTime size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Professionals Found</h3>
                <p className="text-slate-500 text-sm mt-1">
                  We couldn't find any {profession} in "{location}". <br/>
                  Try searching for a different location or profession.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}