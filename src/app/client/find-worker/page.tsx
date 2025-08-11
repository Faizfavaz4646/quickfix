'use client'
import axios from "axios";
import Image from "next/image";
import { useState } from "react";

export default function FindWorker() {
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!profession) return; // Avoid empty profession search
    try {
      const res = await axios.get("http://localhost:50001/users");
      const workers = res.data.filter((user: any) => {
        if (
          user.role !== "worker" ||
          !user.workerProfile ||
          !user.workerProfile.profession
        ) {
          return false;
        }

        const matchesProfession = user.workerProfile.profession
          .toLowerCase()
          .includes(profession.toLowerCase());

        const matchesLocation = `${user.workerProfile.city || ""} ${user.workerProfile.state || ""}`
          .toLowerCase()
          .includes(location.toLowerCase());

        return matchesProfession && matchesLocation;
      });

      setSearchResult(workers);
    } catch (error) {
      console.error("Error fetching workers", error);
    }
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden pb-10">
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
        <div className="mb-8 mt-30">
          <h1 className="text-5xl sm:text-4xl lg:text-6xl font-bold text-white drop-shadow-lg">
            <span className="text-blue-400">Find</span> Trusted Service{" "}
            <span className="text-blue-400">Professionals</span>
          </h1>
          <p className="text-white text-sm sm:text-base mt-2 drop-shadow-md">
            Connect with verified experts in your area
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white bg-opacity-90 backdrop-blur-md shadow-xl rounded-2xl w-full max-w-4xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-3 mb-8 mt-15">
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm sm:text-base rounded-md font-semibold transition"
          >
            Search
          </button>
        </div>
{/* Search Results */}
<div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl text-left">
  {searchResult.length > 0 ? (
    <ul>
      {searchResult.map((worker, index) => (
        <li
          key={index}
          className="flex items-center gap-4 border-b border-gray-200 py-2 font-medium text-gray-800"
        >
          {/* Worker Image */}
          {worker.workerProfile.profilePic && worker.workerProfile.profilePic.trim() !== "" ? (
            <Image
              src={worker.workerProfile.profilePic}
              alt={worker.name || "Worker"}
              width={50}
              height={50}
              className="rounded-full object-cover w-10 h-10"
            />
          ) : (
            <Image
              src="/images/avatar.avif" // fallback image
              alt="Default avatar"
              width={50}
              height={50}
              className="rounded-full object-cover w-10 h-10"
            />
          )}

          {/* Worker Name */}
          <span>{worker.name}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500 text-sm">No workers found</p>
  )}
</div>

      </div>
    </section>
  );
}
