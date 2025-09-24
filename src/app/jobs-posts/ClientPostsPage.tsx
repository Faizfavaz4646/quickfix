"use client";

import { useEffect, useState } from "react";
import { FaThumbsUp } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useAuthStore } from "@/store/authStore";
import {
  fetchJobsForWorkers,
  likeJob,
  unlikeJob,
  commentOnJob,
  deleteCommentByClient,
  deleteClientPost,
} from "@/services/JobsService";
import { Job, User, Comment } from "@/types/user";

export type JobWithClientProfile = Job & {
  likes: string[];
  comments: Comment[];
  clientProfile?: User;
};

export default function ClientPostsPage() {
  const [jobs, setJobs] = useState<JobWithClientProfile[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const { user } = useAuthStore();
  const currentUserId = user?.id ? String(user.id) : "";
  const currentUserName = user?.name || "";

  // Load all jobs
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
        setJobs(jobsWithDefaults.reverse());
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  // Unified function to get profile pic
  const getProfilePic = (profile: User | null | undefined) => {
    if (!profile) return "/default-avatar.png";
    if (profile.role === "client") return profile.profile?.profilePic || "/default-client.png";
    return profile.profilePic || "/default-worker.png";
  };

  // Like/Unlike Handler
  const handleLike = async (jobId: string | number) => {
    if (!currentUserId) return;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const hasLiked = job.likes.includes(currentUserId);
    const success = hasLiked
      ? await unlikeJob(jobId, currentUserId)
      : await likeJob(jobId, currentUserId);

    if (success) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, likes: hasLiked ? j.likes.filter((id) => id !== currentUserId) : [...j.likes, currentUserId] }
            : j
        )
      );
    }
  };

  // Add comment
  const handleComment = async (jobId: string | number, text: string) => {
    if (!currentUserId || !text) return;

    const success = await commentOnJob(jobId, currentUserId, text);
    if (!success) return;

    const profilePic = getProfilePic(user);

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUserName,
       clientName: currentUserName,
      text,
      date: new Date().toISOString(),
      profilePic,
    };

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, comments: [...j.comments, newComment] } : j
      )
    );

    setCommentInputs((prev) => ({ ...prev, [jobId]: "" }));
  };

  // Delete comment
  const handleDeleteComment = async (jobId: string | number, commentId: string | number) => {
    if (!currentUserId || !confirm("Are you sure you want to delete this comment?")) return;

    try {
      const updatedJob = await deleteCommentByClient(jobId, commentId, currentUserId);
      if (updatedJob) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, comments: updatedJob.comments ?? [] } : j))
        );
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Delete post
  const handleDeletePost = async (jobId: string | number) => {
    if (!currentUserId || !confirm("Are you sure you want to delete this post?")) return;

    try {
      const success = await deleteClientPost(jobId, currentUserId);
      if (success) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  if (loading) return <div className="p-6 text-center w-full">Loading posts...</div>;
  if (jobs.length === 0) return <div className="p-6 text-center w-full">No posts available</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {jobs.slice(0, visibleCount).map((job) => {
          const isOwnPost = String(job.clientId) === currentUserId;

          return (
            <div key={job.id} className="w-full rounded-lg shadow bg-white hover:shadow-lg transition p-4">
              {/* Client Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getProfilePic(job.clientProfile)}
                    alt={job.clientName}
                    className="w-12 h-12 rounded-full border object-cover"
                  />
                  <div>
                    <p className="font-medium">{job.clientName}</p>
                    <p className="text-sm text-gray-500">
                      {job.clientProfile?.state || "Unknown"}, {job.clientProfile?.district || "Unknown"}, {job.clientProfile?.city || "Unknown"}
                    </p>
                  </div>
                </div>

                {isOwnPost && (
                  <div className="relative">
                    <details>
                      <summary className="list-none cursor-pointer">
                        <BsThreeDotsVertical />
                      </summary>
                      <div className="absolute right-0 mt-1 w-24 bg-white border rounded shadow">
                        <button
                          onClick={() => handleDeletePost(job.id)}
                          className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete Post
                        </button>
                      </div>
                    </details>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <p className="mb-3 whitespace-pre-line">{job.description}</p>

              {/* Job Images */}
              {job.images && job.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {job.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Job ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Likes Info */}
              <p className="text-sm text-gray-500 mb-1">
                {job.likes.length > 0 ? `${job.likes.length} people liked this` : "No likes yet"}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => handleLike(job.id)}
                  className={`flex items-center gap-1 text-sm font-medium ${job.likes.includes(currentUserId) ? "text-blue-500" : "text-gray-600"}`}
                >
                  <FaThumbsUp /> Like
                </button>
              </div>

              {/* Comments Section */}
              <div className="mt-3 pt-2 space-y-2">
                {job.comments.map((comment) => {
                  const canDelete = String(comment.userId) === currentUserId || isOwnPost;
                  return (
                    <div key={`${job.id}-${comment.id}`} className="flex items-start gap-2">
                      <img
                        src={comment.profilePic || "/default-avatar.png"}
                        alt={comment.userName}
                        className="w-8 h-8 rounded-full border object-cover mt-1"
                      />
                      <div className="flex-1 text-sm bg-gray-100 rounded-lg px-2 py-1 relative">
                        <span className="font-medium">{comment.userName}: </span>
                        {comment.text}

                        {canDelete && (
                          <div className="absolute top-1 right-1">
                            <details>
                              <summary className="list-none cursor-pointer">
                                <BsThreeDotsVertical />
                              </summary>
                              <div className="absolute right-0 mt-1 w-24 bg-white border rounded shadow">
                                <button
                                  onClick={() => handleDeleteComment(job.id, comment.id)}
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

                {/* Add new comment input */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[job.id] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({ ...prev, [job.id]: e.target.value }))
                    }
                    className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => handleComment(job.id, commentInputs[job.id] || "")}
                    className="text-blue-500 font-medium text-sm"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Load More Button */}
        {visibleCount < jobs.length && (
          <div className="text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="text-blue-600 font-medium hover:underline"
            >
              Load more posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
