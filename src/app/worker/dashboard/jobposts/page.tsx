"use client";

import { useEffect, useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useAuthStore } from "@/store/authStore";
import {
  fetchJobsForWorkers,
  likeJob,
  unlikeJob,
  commentOnJob,
  deleteComment,
} from "@/services/JobsService";
import { Job, User, Comment } from "@/types/user";
import Hero from "@/components/ui/Hero";

export type JobWithClientProfile = Job & {
  likes: string[];
  comments: Comment[];
  clientProfile?: User;
};

export default function WorkerJobPostsPage() {
  const [jobs, setJobs] = useState<JobWithClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const currentUserId = user?.id ? String(user.id) : "";
  const currentUserName = user?.name || "";

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const allJobs = await fetchJobsForWorkers();

        const jobsWithDefaults: JobWithClientProfile[] = allJobs.map((job) => ({
          ...job,
          likes: Array.isArray(job.likes) ? job.likes.map(String) : [],
          comments: Array.isArray(job.comments) ? job.comments : [],
          clientProfile: job.clientProfile,
        }));

        setJobs(jobsWithDefaults);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleLike = async (jobId: string | number) => {
    if (!currentUserId) return;

    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    if (job.likes.includes(currentUserId)) {
      const success = await unlikeJob(jobId, currentUserId);
      if (success) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, likes: j.likes.filter((id) => id !== currentUserId) }
              : j
          )
        );
      }
    } else {
      const success = await likeJob(jobId, currentUserId);
      if (success) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, likes: [...j.likes, currentUserId] } : j
          )
        );
      }
    }
  };

  const handleComment = async (jobId: string | number) => {
    if (!currentUserId) return;

    const text = prompt("Enter your comment:");
    if (!text) return;

    const success = await commentOnJob(jobId, currentUserId, text);
    if (success) {
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: currentUserName,
        clientName: currentUserName,
        text,
        date: new Date().toISOString(),
        profilePic: user?.profilePic ?? "/default-avatar.png",
      };

      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, comments: [...j.comments, newComment] } : j
        )
      );
    }
  };

  const handleDeleteComment = async (
    jobId: string | number,
    commentId: string | number
  ) => {
    const confirmDelete = confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      const updatedJob = await deleteComment(jobId, commentId);
      if (updatedJob) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, comments: updatedJob.comments ?? [] } : j
          )
        );
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  if (loading)
    return <div className="p-6 text-center w-full">Loading jobs...</div>;
  if (jobs.length === 0)
    return <div className="p-6 text-center w-full">No jobs available</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Hero />

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="w-full border rounded-lg shadow bg-white hover:shadow-lg transition p-4"
          >
            {/* Client Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              {job.clientProfile?.profilePic && (
                <img
                  src={job.clientProfile.profilePic}
                  alt={job.clientName}
                  className="w-12 h-12 rounded-full border object-cover"
                />
              )}
              <div>
                <p className="font-medium">{job.clientName}</p>
                <p className="text-sm text-gray-500">
                  {job.clientProfile?.state || "Unknown"},{" "}
                  {job.clientProfile?.district || "Unknown"},{" "}
                  {job.clientProfile?.city || "Unknown"}
                </p>
              </div>
            </div>

            {/* Job Description */}
            <p className="mb-3 whitespace-pre-line">{job.description}</p>

            {/* Job Images */}
            {job.images?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {job.images.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Job ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : null}

            {/* Likes info */}
            <p className="text-sm text-gray-500 mb-1">
              {job.likes.length > 0
                ? `${job.likes.length} people liked this`
                : "No likes yet"}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 border-t pt-2">
              <button
                onClick={() => handleLike(job.id)}
                className={`flex items-center gap-1 text-sm font-medium ${
                  job.likes.includes(currentUserId)
                    ? "text-blue-500"
                    : "text-gray-600"
                }`}
              >
                <FaThumbsUp />
                Like
              </button>

              <button
                onClick={() => handleComment(job.id)}
                className="flex items-center gap-1 text-sm font-medium text-gray-600"
              >
                <FaComment />
                Comment
              </button>
            </div>

            {/* Comments Section */}
            {job.comments && job.comments.length > 0 && (
              <div className="mt-3 border-t pt-2 space-y-2">
                {job.comments.map((comment) => {
                  const canDelete =
                    comment.userId === currentUserId ||
                    job.clientProfile?.id === user?.id;

                  return (
                    <div
                      key={`${job.id}-${comment.id}`}
                      className="flex items-start gap-2"
                    >
                      {comment.profilePic && (
                        <img
                          src={comment.profilePic}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full border object-cover mt-1"
                        />
                      )}
                      <div className="flex-1 text-sm bg-gray-100 rounded-lg px-2 py-1 relative">
                        <span className="font-medium">{comment.userName}: </span>
                        {comment.text}

                        {canDelete && (
                          <div className="absolute top-1 right-1">
                            <details className="relative">
                              <summary className="list-none cursor-pointer">
                                <BsThreeDotsVertical />
                              </summary>
                              <div className="absolute right-0 mt-1 w-24 bg-white border rounded shadow">
                                <button
                                  onClick={() =>
                                    handleDeleteComment(job.id, comment.id)
                                  }
                                  className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
