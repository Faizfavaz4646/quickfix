"use client";

import { FiStar } from "react-icons/fi";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

interface WorkerRatingProps {
  userId?: string; 
}

export default function WorkerRating({ userId }: WorkerRatingProps) {
  const [avgRating, setAvgRating] = useState<number>(0);
  const maxStars = 5;
  const { user: authUser, hasHydrated } = useAuthStore();
  const workerId = userId || authUser?._id;

  useEffect(() => {
    if (!hasHydrated || !workerId) return;

    const fetchWorkerRating = async () => {
      try {
        // ✅ FIX: Use port 5001 and try '/worker' (singular)
        // If this still 404s, fetch '/workers' (plural)
        const { data } = await axios.get(`http://localhost:5001/worker?userId=${workerId}`);

        // Handle Array vs Object response safely
        const workerData = Array.isArray(data) ? data[0] : data;

        if (workerData && workerData.ratings) {
          const ratings: number[] = workerData.ratings;
          const average = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;
          setAvgRating(average);
        }
      } catch (err) {
        console.error("Rating fetch failed - Check if route is /worker or /workers");
      }
    };

    fetchWorkerRating();
  }, [workerId, hasHydrated]);

  if (!hasHydrated) return <div className="w-full h-32 animate-pulse bg-gray-100 rounded-lg mt-4" />;

  return (
    <div className="w-full h-32 rounded-xl p-5 mt-4 bg-white border border-gray-100 hover:shadow-md hover:border-yellow-200 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-gray-800">Rating</h3>
        <div className="p-2 bg-yellow-50 text-yellow-500 rounded-lg">
           <FiStar className="w-5 h-5 fill-yellow-500" />
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2">
        {[...Array(maxStars)].map((_, i) => (
          <span key={i} className={`text-xl ${i < Math.round(avgRating) ? "text-yellow-500" : "text-gray-200"}`}>★</span>
        ))}
        <span className="ml-2 text-sm text-gray-600 font-bold">
          {avgRating.toFixed(1)} <span className="text-gray-400 font-normal">/ {maxStars}</span>
        </span>
      </div>
    </div>
  );
}