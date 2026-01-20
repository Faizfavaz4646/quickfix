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
  
  // Get both user and hasHydrated from the store
  const { user: authUser, hasHydrated } = useAuthStore();

  // Determine the ID to fetch
  const workerId = userId || authUser?._id;

  useEffect(() => {
    /**
     * GUARD 1: Wait for Zustand hydration
     * GUARD 2: Ensure workerId is a valid value (not "undefined" string)
     */
    const isValidId = hasHydrated && workerId && String(workerId) !== "undefined";

    if (!isValidId) {
      return;
    }

    const fetchWorkerRating = async () => {
      try {
        // Updated URL to match your standard service patterns if necessary
        const { data: workers } = await axios.get(
          `http://localhost:5001/workers?userId=${workerId}`
        );

        if (!workers || workers.length === 0) {
          setAvgRating(0);
          return;
        }

        // Logic to extract average rating
        const worker = workers[0];
        const ratings: number[] = worker.ratings || [];

        const average =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;

        setAvgRating(average);
      } catch (err) {
        // Log the error but don't crash the UI
        console.error("Error fetching worker ratings:", err);
        setAvgRating(0);
      }
    };

    fetchWorkerRating();
  }, [workerId, hasHydrated]); // Add hasHydrated as a dependency

  // Optional: Show a skeleton/loading state while hydrating
  if (!hasHydrated) {
    return <div className="w-full h-32 animate-pulse bg-gray-100 rounded-lg mt-4" />;
  }

  return (
    <div className="w-full h-32 rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out flex flex-col border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg text-gray-800">Rating</h3>
        <FiStar className="text-yellow-500 w-6 h-6 fill-yellow-500" />
      </div>

      <div className="flex items-center gap-1 mt-2">
        {[...Array(maxStars)].map((_, i) => (
          <span
            key={i}
            className={`text-xl ${
              i < Math.round(avgRating) ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600 font-bold">
          {avgRating.toFixed(1)} <span className="text-gray-400 font-normal">/ {maxStars}</span>
        </span>
      </div>
    </div>
  );
}