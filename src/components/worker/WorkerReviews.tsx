"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Review {
  _id?: string;
  clientId: string;
  clientName?: string;
  clientProfilePic?: string;
  review: string;
  rating: number;
  date: string;
}

interface WorkerReviewsProps {
  userId: string;
}

export default function WorkerReviews({ userId }: WorkerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        // ✅ FIX 1: Port 5001 and try '/worker' (singular)
        const { data } = await axios.get(`http://localhost:5001/worker?userId=${userId}`);
        const workerData = Array.isArray(data) ? data[0] : data;

        if (!workerData || !workerData.reviews) {
          setReviews([]);
          return;
        }

        // ✅ FIX 2: Fetch Client details from Port 5001
        const reviewsWithDetails = await Promise.all(
          workerData.reviews.map(async (rev: any) => {
            try {
              if (rev.clientId) {
                  // Assuming GET /users/:id exists on backend
                  const { data: user } = await axios.get(`http://localhost:5001/users/${rev.clientId}`);
                  return { 
                    ...rev, 
                    clientName: user.name || "Client",
                    clientProfilePic: user.profilePic || "/images/avatar.avif" 
                  };
              }
              return rev;
            } catch (e) {
              return { ...rev, clientName: "Client", clientProfilePic: "/images/avatar.avif" };
            }
          })
        );

        setReviews(reviewsWithDetails);
      } catch (err) {
        console.error("Reviews fetch failed");
        setError("Could not load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  if (loading) return <div className="text-sm text-gray-400 mt-4 text-center">Loading reviews...</div>;
  if (error) return <div className="text-sm text-red-400 mt-4 text-center">No reviews found.</div>;

  return (
    <div className="border border-gray-100 bg-white w-full shadow-sm rounded-xl p-6 mt-4 hover:shadow-md transition-all">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Reviews</h3>
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="border-b border-gray-50 pb-4 last:border-b-0">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={review.clientProfilePic || "/images/avatar.avif"}
                  alt="Client"
                  className="w-10 h-10 rounded-full object-cover bg-gray-100"
                  onError={(e) => (e.currentTarget.src = "/images/avatar.avif")}
                />
                <div>
                    <p className="text-sm font-bold text-gray-800">{review.clientName || "Client"}</p>
                    <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                        ))}
                    </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">"{review.review}"</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}