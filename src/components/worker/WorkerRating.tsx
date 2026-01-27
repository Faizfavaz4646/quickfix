"use client";

import { FiStar } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getWorkerRating } from "@/services/workerService";
import { Loader2 } from "lucide-react";

interface WorkerRatingProps {
  userId?: string; 
}

export default function WorkerRating({ userId }: WorkerRatingProps) {
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const maxStars = 5;
  
  const { user: authUser, hasHydrated } = useAuthStore();
  const workerId = userId || authUser?._id;

  useEffect(() => {
    // 🔍 DEBUG 1: Check if we have the ID to start fetching
    if (!hasHydrated) return;
    console.log("⭐ [WorkerRating] Init. WorkerID:", workerId);

    if (!workerId) {
      console.warn("⚠️ [WorkerRating] No Worker ID found. Skipping fetch.");
      setLoading(false);
      return;
    }

    const fetchRating = async () => {
      setLoading(true);
      try {
        console.log("🚀 [WorkerRating] Calling service for:", workerId);
        
        // Call service
        const rating = await getWorkerRating(workerId);
        
        // 🔍 DEBUG 2: What did the service return?
        console.log("✅ [WorkerRating] Service returned:", rating, "Type:", typeof rating);

        setAvgRating(rating);
      } catch (error) {
        console.error("🔥 [WorkerRating] Component Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [workerId, hasHydrated]);

  if (loading || !hasHydrated) {
    return (
      <div className="w-full h-32 rounded-xl p-5 mt-4 bg-white border border-gray-100 flex items-center justify-center">
         <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

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
          <span key={i} className={`text-xl ${i < Math.round(avgRating) ? "text-yellow-500" : "text-gray-200"}`}>
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600 font-bold">
          {/* Ensure we display 0.0 if rating is missing/NaN */}
          {(avgRating || 0).toFixed(1)} <span className="text-gray-400 font-normal">/ {maxStars}</span>
        </span>
      </div>
    </div>
  );
}