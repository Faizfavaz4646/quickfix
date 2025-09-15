"use client";

import { useState } from "react";
import { FaStar, FaCheckCircle, FaClock, FaHourglassHalf } from "react-icons/fa";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Job } from "@/types/user";
import { submitRatingAndReview } from "@/services/workerService";
import { JSX } from "react/jsx-runtime";

interface Props {
  requests: Job[];
  refreshRequests: () => void;
}

export default function RequestCard({ requests, refreshRequests }: Props) {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  const { user } = useAuthStore();
  const clientId = user?.id;
  const clientName = user?.name;

  const statusStyles: Record<Job["status"], { color: string; icon: JSX.Element }> = {
    pending: { color: "bg-yellow-500", icon: <FaClock /> },
    ongoing: { color: "bg-blue-500", icon: <FaHourglassHalf /> },
    completed: { color: "bg-green-500", icon: <FaCheckCircle /> },
  };

  const handleReviewSubmit = async (job: Job) => {
    if (!clientId || !clientName) {
      toast.error("Please login as a client to submit reviews.");
      return;
    }
    if (!rating && !review.trim()) {
      toast.error("Please provide rating or review.");
      return;
    }
    if (!job.workerId) {
      toast.error("Worker ID missing for this job.");
      return;
    }

    try {
      const result = await submitRatingAndReview(
        clientId,
        job.workerId,
        job.id,
        rating,
        review,
        clientName
      );

      if (result?.success) {
        toast.success("Review submitted successfully ✅");
        refreshRequests();
        setSelectedJobId(null);
        setRating(0);
        setReview("");
      } else {
        toast.error("Failed to submit review.");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      toast.error("Something went wrong while submitting review.");
    }
  };

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((job, idx) => {
        const isSelected = selectedJobId === job.id;
        const statusStyle = statusStyles[job.status] || {
          color: "bg-gray-400",
          icon: <FaHourglassHalf />,
        };

        // ✅ Use job id + status + index to guarantee uniqueness
        const uniqueKey = `${job.id}-${job.status}-${idx}`;

        return (
          <div
            key={uniqueKey}
            className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between"
          >
            {/* Status with Icon */}
            <div className="flex items-center gap-2">
              <span className={`${statusStyle.color} w-3 h-3 rounded-full`} />
              {statusStyle.icon}
              <span className="text-sm text-gray-500 capitalize">{job.status}</span>
            </div>

            {/* Worker Info */}
            <div className="mt-3">
              <h3 className="text-lg font-semibold">{job.name || "N/A"}</h3>
              <p className="text-gray-600 text-sm">{job.contact || "N/A"}</p>
              <p className="text-gray-400 text-xs mt-1">
                Date: {job.date ? new Date(job.date).toLocaleDateString() : "N/A"}
              </p>
            </div>

            {/* Completed Job Review Section */}
            {job.status === "completed" && (
              <div className="mt-4">
                {isSelected ? (
                  <>
                    <div className="flex gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          onClick={() => setRating(star)}
                          className={`cursor-pointer ${
                            rating >= star ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Write your review..."
                      className="w-full border rounded-md p-2 text-sm mb-2"
                    />

                    <button
                      disabled={!rating && !review.trim()}
                      onClick={() => handleReviewSubmit(job)}
                      className={`mt-2 px-4 py-1 rounded-md text-sm ${
                        !rating && !review.trim()
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-sky-600 text-white"
                      }`}
                    >
                      Submit Rating & Review
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedJobId(job.id)}
                    className="mt-3 text-sm bg-sky-100 text-sky-600 px-3 py-1 rounded-md"
                  >
                    Add Rating / Review
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
