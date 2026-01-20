"use client";

import { useState } from "react";
import { MdOutlineVerifiedUser, MdOutlineAccessTime } from "react-icons/md";
import { AiFillStar } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import { searchWorkers } from "@/services/workerService"; 

// Helper: render stars based on rating
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex text-yellow-400 text-sm">
      {Array(fullStars).fill(0).map((_, i) => <AiFillStar key={`full-${i}`} />)}
      {halfStar && <AiFillStar key="half" className="text-yellow-400/50" />}
      {Array(emptyStars).fill(0).map((_, i) => (
        <AiFillStar key={`empty-${i}`} className="text-gray-300" />
      ))}
    </div>
  );
};

// Calculate average rating
const getAverageRating = (worker: any) => {
  const ratings = worker.ratings || [];
  if (!ratings.length) return 0;
  return ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
};

export default function FindWorker() {
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!profession) return;

    try {
      const results = await searchWorkers(profession, location);
      setSearchResult(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching workers", error);
    }
  };

  return (
    <section className="relative w-full min-h-screen overflow-x-hidden pb-10">
      {/* Background Image */}
      <Image
        src="/images/cleaning.jpg"
        alt="Worker background"
        fill
        className="object-cover opacity-70"
        priority
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center text-center px-4">
        {/* Headings */}
        <div className="mb-8 mt-28 sm:mt-32 lg:mt-40">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white drop-shadow-lg leading-snug">
            <span className="text-blue-400">Find</span> Trusted Service{" "}
            <span className="text-blue-400">Professionals</span>
          </h1>
          <p className="text-white text-sm sm:text-base mt-3 drop-shadow-md max-w-lg mx-auto">
            Connect with verified experts in your area
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white bg-opacity-90 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-4xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-3 mb-6">
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="flex-1 px-4 py-3 rounded-md border text-black"
          >
            <option value="">🔍 Select a profession</option>
            <option value="Plumber">Plumber</option>
            <option value="Electrician">Electrician</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Painter">Painter</option>
            <option value="Mechanic">Mechanic</option>
            <option value="HVAC Technician">HVAC Technician</option>
          </select>

          <input
            type="text"
            placeholder="📍 Enter your location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 px-4 py-3 rounded-md border text-black"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold"
          >
            Search
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 text-white mb-8 text-sm">
          <div className="flex items-center gap-2">
            <MdOutlineVerifiedUser size={20} className="text-blue-400" />
            <span>10,000+ Verified Professionals</span>
          </div>
          <div className="flex items-center gap-2">
            <AiFillStar size={20} className="text-yellow-400" />
            <span>Real Ratings from users</span>
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineAccessTime size={20} className="text-green-400" />
            <span>Same-Day Availability</span>
          </div>
        </div>

        {/* Results */}
        {showResults && (
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl text-left max-h-80 overflow-y-auto">
            {searchResult.length > 0 ? (
              <ul className="divide-y">
                {searchResult.map((worker, index) => {
                  const rating = getAverageRating(worker);

                  return (
                    <li key={index} className="py-3 px-2 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Image
                          src={worker.profilePic || "/images/avatar.avif"}
                          alt={worker.userId.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />

                        <div>
                          {renderStars(rating)}

                          <Link
                            href={`/client/workerprofile/${worker._id}`}
                            className="font-semibold hover:text-blue-600"
                          >
                            {worker.userId.name}
                          </Link>

                          <div className="text-xs text-gray-500">
                            {worker.completedJobs?.length ?? 0} Jobs Completed
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No workers found</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
