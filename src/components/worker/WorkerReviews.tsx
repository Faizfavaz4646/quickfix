"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Review {
  id: number;
  clientId: string;
  clientName: string;
  clientProfilePic?: string; // optional profile picture
  review: string;
  rating: number;
  date: string;
}

interface WorkerReviewsProps {
  userId: string; // the logged-in user ID
}

export default function WorkerReviews({ userId }: WorkerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        // fetch the worker entry using userId
        const { data: workers } = await axios.get(`http://localhost:50001/workers?userId=${userId}`);
        if (workers.length === 0) {
          setReviews([]);
          return;
        }

        const worker = workers[0];

        // Map reviews to include client profile pics from users DB
        const reviewsWithPics = await Promise.all(
          (worker.reviews || []).map(async (rev: Review) => {
            try {
              const { data: users } = await axios.get(`http://localhost:50001/users?id=${rev.clientId}`);
              return { ...rev, clientProfilePic: users[0]?.profile?.profilePic || "" };
            } catch {
              return rev;
            }
          })
        );

        setReviews(reviewsWithPics);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  if (loading) return <div className="text-sm text-gray-500">Loading reviews...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className="border border-gray-200 w-full shadow-md rounded-md p-4 mt-4 hover:shadow-xl transition">
      <h3 className="font-semibold mb-2">Reviews</h3>
      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-2 last:border-b-0">
              {/* Client profile + name */}
              <div className="flex items-center gap-2 mb-1">
                {review.clientProfilePic && (
                  <img
                    src={review.clientProfilePic}
                    alt={review.clientName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium">{review.clientName}</span>
              </div>

              <p className="text-xs text-gray-500">"{review.review}"</p>

              <div className="flex mt-1 text-yellow-500 text-sm">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < review.rating ? "⭐" : "☆"}</span>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-1">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
