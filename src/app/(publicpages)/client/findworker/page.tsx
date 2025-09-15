"use client";

import { useState } from "react";
import { MdOutlineVerifiedUser, MdOutlineAccessTime } from "react-icons/md";
import { AiFillStar } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import { fetchAllWorkers, getWorkerProfile } from "@/services/workerService";

// Helper: render stars based on rating
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex text-yellow-400 text-sm">
      {Array(fullStars).fill(0).map((_, i) => <AiFillStar key={`full-${i}`} />)}
      {halfStar && <AiFillStar key="half" className="text-yellow-400/50" />}
      {Array(emptyStars).fill(0).map((_, i) => <AiFillStar key={`empty-${i}`} className="text-gray-300" />)}
    </div>
  );
};

// Calculate average rating from worker.ratings array
const getAverageRating = (worker: any) => {
  const ratings = worker.ratings || [];
  if (ratings.length === 0) return 0;
  const total = ratings.reduce((sum: number, r: number) => sum + r, 0);
  return total / ratings.length;
};

export default function FindWorker() {
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!profession) return;

    try {
      // Fetch all workers
      const workersData = await fetchAllWorkers();

      // Filter workers by profession and location
      const filteredWorkers = workersData.filter((worker: any) => {
        const matchesProfession = worker.profession
          ?.toLowerCase()
          .includes(profession.toLowerCase());

        const matchesLocation = `${worker.city || ""} ${worker.state || ""} ${worker.district || ""}`
          .toLowerCase()
          .includes(location.toLowerCase());

        return matchesProfession && matchesLocation;
      });

      // Fetch full profiles for each filtered worker
      const workersWithProfiles = await Promise.all(
        filteredWorkers.map(async (worker: any) => {
          const profile = await getWorkerProfile(worker.userId);
          return profile || { ...worker, name: "Unknown", ratings: [], completedJobs: [] };
        })
      );

      setSearchResult(workersWithProfiles);
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
            className="flex-1 px-4 py-3 text-sm sm:text-base rounded-md border border-gray-300 focus:outline-none text-black"
          >
            <option value="">🔍 Select a profession</option>
            <option value="plumber">Plumber</option>
            <option value="electrician">Electrician</option>
            <option value="cleaner">Cleaner</option>
            <option value="carpenter">Carpenter</option>
            <option value="painter">Painter</option>
            <option value="mechanic">Mechanic</option>
            <option value="HVAC Technician">HVAC Technician</option>
          </select>

          <input
            type="text"
            placeholder="📍 Enter your location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 px-4 py-3 text-sm sm:text-base rounded-md border border-gray-300 focus:outline-none text-black"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm sm:text-base rounded-md font-semibold transition w-full sm:w-auto"
          >
            Search
          </button>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-white mb-8 text-xs sm:text-sm md:text-base">
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

        {/* Search Results */}
        {showResults && (
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl text-left max-h-80 overflow-y-auto">
            {searchResult.length > 0 ? (
              <ul className="divide-y divide-gray-200 bg-white rounded-md">
                {searchResult.map((worker, index) => {
                  const rating = getAverageRating(worker);

                  return (
                    <li
                      key={index}
                      className="flex flex-col items-start gap-1 py-3 font-medium text-gray-800 hover:bg-gray-50 transition rounded-md px-2"
                    >
                      <div className="flex items-center gap-3">
                        {worker.profilePic?.startsWith("data:image") ? (
                          <img
                            src={worker.profilePic}
                            alt={worker.name || "Worker"}
                            className="rounded-full object-cover w-12 h-12"
                          />
                        ) : (
                          <Image
                            src={worker.profilePic || "/images/avatar.avif"}
                            alt={worker.name || "Worker"}
                            width={50}
                            height={50}
                            className="rounded-full object-cover w-12 h-12"
                          />
                        )}

                        <div className="flex flex-col">
                          {/* Render real stars */}
                          {renderStars(rating)}

                          {/* Worker Name */}
                          <Link
                            href={`/client/workerprofile/${worker.userId}`}
                            className="hover:text-blue-600 transition font-semibold"
                          >
                            {worker.name}
                          </Link>

                          {/* Completed Jobs */}
                          <span className="text-gray-500 text-xs">
                            {worker.completedJobs?.length ?? 0} Jobs Completed
                          </span>
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
