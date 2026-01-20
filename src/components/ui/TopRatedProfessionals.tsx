"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { Profile } from "@/types/user";

// Predefined gradient styles 🎨
const gradients = [
  "linear-gradient(to right, #f43f5e, #f59e0b)", // red → amber
  "linear-gradient(to right, #3b82f6, #8b5cf6)", // blue → violet
  "linear-gradient(to right, #10b981, #06b6d4)", // green → cyan
  "linear-gradient(to right, #ec4899, #f97316)", // pink → orange
  "linear-gradient(to right, #6366f1, #22d3ee)", // indigo → cyan
];

export default function TopRatedProfessionals() {
  const [workers, setWorkers] = useState<Profile[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5001/workers").then((res) => {
      const filtered = res.data.filter((w: Profile) => {
        const avg =
          w.ratings && w.ratings.length > 0
            ? w.ratings.reduce((a, b) => a + b, 0) / w.ratings.length
            : 0;
        return avg >= 2;
      });
      setWorkers(filtered);
    });
  }, []);

  if (workers.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Top-Rated Professionals Near You
        </h2>
        <p className="text-gray-600 mt-2 text-sm">
          Discover the best-of-the-best on QuickFix. These top-rated pros are
          celebrated for their exceptional service and skill.
        </p>

        {/* Workers Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workers.slice(0, 6).map((worker) => {
            const avg =
              worker.ratings && worker.ratings.length > 0
                ? worker.ratings.reduce((a, b) => a + b, 0) /
                  worker.ratings.length
                : 0;

            // pick a random gradient per worker
            const gradient =
              gradients[Math.floor(Math.random() * gradients.length)];

            return (
              <div
                key={worker._id}
                className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center hover:shadow-lg transition"
              >
                {/* Profile Pic with Gradient Border */}
                <div
                  className="relative w-20 h-20 rounded-full p-[2px]"
                  style={{ background: gradient }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src={worker.profilePic || "/images/avatar.avif"}
                      alt={worker.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-3 text-gray-800">
                  {worker.name}
                </h3>
                <p className="text-gray-500 text-sm">{worker.profession}</p>

                {/* Rating */}
                <div className="flex justify-center mt-1 text-yellow-500 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < Math.round(avg)
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>

                {/* Location */}
                <p className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                  <FaMapMarkerAlt className="text-blue-500" />
                  {worker.city}, {worker.state}
                </p>
              </div>
            );
          })}
        </div>

        {/* Button */}
        <button className="mt-8 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition">
          View All Professionals
        </button>
      </div>
    </section>
  );
}
