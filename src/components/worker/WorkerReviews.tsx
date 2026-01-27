"use client";

import { useEffect, useState } from "react";
import { getWorkerReviews, ReviewData } from "@/services/reviewService";
import { Loader2 } from "lucide-react";

interface WorkerReviewsProps {
  userId: string;
}

export default function WorkerReviews({ userId }: WorkerReviewsProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      const data = await getWorkerReviews(userId);
      setReviews(data);
      setLoading(false);
    };

    loadData();
  }, [userId]);

  // ✅ DEBUGGABLE IMAGE URL BUILDER
  const getImageUrl = (path?: string) => {
    // 🔍 DEBUG 1: See exactly what the database is giving us
    console.log("📸 Processing Image Path:", path);

    if (!path) return "/images/avatar.avif"; 

    // If it's already a full link (Google/Facebook), return it
    if (path.startsWith("http") || path.startsWith("https")) return path;

    // 🔍 DEBUG 2: Check if we are accidentally adding double slashes
    // Change this to your actual backend URL (e.g., http://localhost:5001)
    const backendUrl = "http://localhost:5001"; 
    
    // Ensure path doesn't start with a slash if we add one, or vice versa
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const finalUrl = `${backendUrl}/${cleanPath}`;

    // 🔍 DEBUG 3: This is the final link the <img> tag will try to load
    console.log("🔗 Final Generated URL:", finalUrl);
    
    return finalUrl;
  };

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="border border-gray-100 bg-white w-full shadow-sm rounded-xl p-6 mt-4 hover:shadow-md transition-all">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Reviews ({reviews.length})</h3>
      
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => {
            // Log the whole client object to ensure 'profilePic' actually exists
            console.log(`👤 Review by ${rev.clientId?.name}:`, rev.clientId);

            return (
              <div key={rev._id} className="border-b border-gray-50 pb-4 last:border-b-0">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={getImageUrl(rev.clientId?.profilePic)}
                    alt={rev.clientId?.name || "Client"}
                    className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200"
                    onError={(e) => {
                      console.error("🚫 Image failed to load:", e.currentTarget.src);
                      e.currentTarget.src = "/images/avatar.avif";
                    }}
                  />
                  
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {rev.clientId?.name || "Client"}
                    </p>
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">"{rev.comment}"</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-sm text-center italic">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}