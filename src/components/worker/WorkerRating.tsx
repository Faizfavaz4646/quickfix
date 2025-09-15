"use client";

import { FiStar } from "react-icons/fi";
import { useEffect, useState } from "react";
import axios from "axios";

interface WorkerRatingProps {
  userId: string; // the worker's userId
}

export default function WorkerRating({ userId }: WorkerRatingProps) {
  const [avgRating, setAvgRating] = useState<number>(0);
  const maxStars = 5;

  useEffect(() => {
    const fetchWorkerRating = async () => {
      try {
        const { data: workers } = await axios.get(`http://localhost:50001/workers?userId=${userId}`);
        if (workers.length === 0) return;

        const worker = workers[0];
        const ratings: number[] = worker.ratings || [];

        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, r) => acc + r, 0);
          const average = sum / ratings.length;
          setAvgRating(average);
        } else {
          setAvgRating(0);
        }
      } catch (err) {
        console.error("Error fetching worker ratings:", err);
      }
    };

    fetchWorkerRating();
  }, [userId]);

  return (
    <div className="w-full h-32 rounded-lg p-4 mt-4 hover:shadow-lg transition duration-300 ease-in-out flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg text-gray-800">Rating</h3>
        <FiStar className="text-yellow-500 w-6 h-6" />
      </div>

      {/* Rating stars */}
      <div className="flex items-center gap-1 mt-2">
        {[...Array(maxStars)].map((_, i) => (
          <span
            key={i}
            className={`text-xl ${i < Math.round(avgRating) ? "text-yellow-500" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {avgRating.toFixed(1)} / {maxStars}
        </span>
      </div>
    </div>
  );
}
