"use client";
import axios from "axios";
import Image from "next/image";
import { useState } from "react";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { AiFillStar } from "react-icons/ai";
import { MdOutlineAccessTime } from "react-icons/md";
import Link from "next/link";

export default function FindWorker() {
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!profession) return;
    try {
      const res = await axios.get("http://localhost:50001/users");
      const workers = res.data.filter((user: any) => {
        if (
          user.role !== "worker" ||
          !user.Profile ||
          !user.Profile.profession
        ) {
          return false;
        }

        const matchesProfession = user.Profile.profession
          .toLowerCase()
          .includes(profession.toLowerCase());

        const matchesLocation = `${user.Profile.city || ""} ${user.Profile.state || ""} ${user.Profile.district || ""}`
          .toLowerCase()
          .includes(location.toLowerCase());

        return matchesProfession && matchesLocation;
      });

      setSearchResult(workers);
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

        {/* Stats Section (now smaller & in one line on large screens) */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-white mb-8 text-xs sm:text-sm md:text-base">
          <div className="flex items-center gap-2">
            <MdOutlineVerifiedUser size={20} className="text-blue-400" />
            <span>10,000+ Verified Professionals</span>
          </div>
          <div className="flex items-center gap-2">
            <AiFillStar size={20} className="text-yellow-400" />
            <span>4.8/5 Avg Rating</span>
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
              <ul className="divide-y divide-gray-200">
                {searchResult.map((worker, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-4 py-3 font-medium text-gray-800 hover:bg-gray-50 transition rounded-md px-2"
                  >
                    <Image
                      src={
                        worker.Profile.profilePic &&
                        worker.Profile.profilePic.trim() !== ""
                          ? worker.Profile.profilePic
                          : "/images/avatar.avif"
                      }
                      alt={worker.name || "Worker"}
                      width={50}
                      height={50}
                      className="rounded-full object-cover w-12 h-12"
                    />
                    <Link
                      href={`/publicpages/worker/${worker.id}`} 
                      className="hover:text-blue-600 transition"
                    >
                      {worker.name}
                    </Link>
                  </li>
                ))}
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
