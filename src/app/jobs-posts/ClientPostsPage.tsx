"use client";

import { useEffect, useState, useRef } from "react";
import { FaThumbsUp } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { TfiReload } from "react-icons/tfi";
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
import axios from "axios";
import { API_URL } from "@/lib/constants";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | number | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const currentUserId = user?.id ? String(user.id) : "";

  // ✅ Fetch jobs + preload user data
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

        const allUserIds = [
          ...new Set(
            jobsWithDefaults.flatMap((job) => job.comments.map((c) => c.userId))
          ),
        ];

        const responses = await Promise.all(
          allUserIds.map((id) => axios.get(`http://localhost:50001/users/${id}`))
        );

        const usersMap: Record<string, User> = {};
        responses.forEach((res) => {
          usersMap[res.data.id] = res.data;
        });

        setUsers(usersMap);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  // ✅ Close modal when clicking outside OR touching outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalOpen(false);
        setSelectedJobId(null);
      }
    };

    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [modalOpen]);

  const getProfilePic = (profile: User | null | undefined) => {
    if (!profile) return "/default-avatar.png";
    if (profile.role === "client") return profile.profile?.profilePic || "/default-client.png";
    return profile.profilePic || "/default-worker.png";
  };

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
            ? {
                ...j,
                likes: hasLiked
                  ? j.likes.filter((id) => id !== currentUserId)
                  : [...j.likes, currentUserId],
              }
            : j
        )
      );
    }
  };

  const handleComment = async (jobId: string | number, text: string) => {
    if (!currentUserId || !text) return;

    const success = await commentOnJob(jobId, currentUserId, text);
    if (!success) return;

  const res = await fetch(`${API_URL}/users/${currentUserId}`);
    const userData: User = await res.json();

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: userData.name,
      clientName: userData.name,
      text,
      date: new Date().toISOString(),
      profilePic: userData.profilePic || "/default-avatar.png",
    };

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, comments: [...j.comments, newComment] } : j
      )
    );

    setCommentInputs((prev) => ({ ...prev, [jobId]: "" }));
  };

  const handleDeleteComment = async (jobId: string | number, commentId: string | number) => {
    if (!currentUserId || !confirm("Delete comment?")) return;

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

  const handleDeletePost = async (jobId: string | number) => {
    if (!currentUserId || !confirm("Delete post?")) return;

    try {
      const success = await deleteClientPost(jobId, currentUserId);
      if (success) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const openCommentModal = (jobId: string | number) => {
    setSelectedJobId(jobId);
    setModalOpen(true);
  };

  const selectedJobComments =
    selectedJobId !== null
      ? jobs.find((j) => j.id === selectedJobId)?.comments || []
      : [];

  if (loading) return <div className="p-6 text-center w-full">Loading posts...</div>;
  if (jobs.length === 0) return <div className="p-6 text-center w-full">No posts available</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 space-y-6 relative">
        {jobs.slice(0, visibleCount).map((job) => {
          const isOwnPost = String(job.clientId) === currentUserId;
          const lastComment = job.comments[job.comments.length - 1];
          const lastCommentUser = lastComment ? users[lastComment.userId] : null;

          return (
            <div
              key={job.id}
              className="w-full rounded-lg shadow bg-white hover:shadow-lg transition p-4 relative"
            >
              {/* Client Info */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getProfilePic(job.clientProfile)}
                    alt={job.clientName}
                    className="w-12 h-12 rounded-full border object-cover"
                  />
                  <div>
                    <p className="font-medium">{job.clientName}</p>
                  </div>
                </div>
                {isOwnPost && (
                  <details className="relative">
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
                )}
              </div>

              {/* Job Description */}
              <p className="mb-3 whitespace-pre-line">{job.description}</p>

              {/* Images */}
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

              {/* Likes */}
              <p className="text-sm text-gray-500 mb-1">
                {job.likes.length > 0 ? `${job.likes.length} likes` : "No likes yet"}
              </p>

              {/* Like button */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => handleLike(job.id)}
                  className={`flex items-center gap-1 text-sm font-medium ${
                    job.likes.includes(currentUserId) ? "text-blue-500" : "text-gray-600"
                  }`}
                >
                  <FaThumbsUp /> Like
                </button>
              </div>

              {/* ✅ Only most recent comment */}
              {lastComment && lastCommentUser && (
                <div
                  className="flex items-start gap-2 mt-3 cursor-pointer"
                  onClick={() => openCommentModal(job.id)}
                >
                  <img
                    src={
                      lastCommentUser.role === "client"
                        ? lastCommentUser.profile?.profilePic || "/default-client.png"
                        : lastCommentUser.profilePic || "/default-worker.png"
                    }
                    alt={lastCommentUser.name}
                    className="w-8 h-8 rounded-full border object-cover mt-1"
                  />
                  <div className="flex-1 text-sm bg-gray-100 rounded-lg px-2 py-1">
                    <span className="font-medium">{lastCommentUser.name}: </span>
                    {lastComment.text}
                    {job.comments.length > 1 && (
                      <span className="text-gray-500 ml-2 text-xs">
                        View all {job.comments.length} comments
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ✅ Comments Modal */}
              {modalOpen && selectedJobId === job.id && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div
                    ref={modalRef}
                    className="bg-white w-full max-w-md max-h-[70vh] rounded-lg shadow-lg overflow-y-auto p-4"
                  >
                    <h3 className="text-sm font-medium mb-3">All Comments</h3>
                    {selectedJobComments.length === 0 && (
                      <p className="text-xs text-gray-500">No comments yet</p>
                    )}
                    {selectedJobComments.map((comment) => {
                      const commentUser = users[comment.userId];
                      const canDelete = String(comment.userId) === currentUserId;

                      return (
                        <div key={comment.id} className="flex items-start gap-2 mb-2">
                          <img
                            src={
                              commentUser?.role === "client"
                                ? commentUser.profile?.profilePic || "/default-client.png"
                                : commentUser?.profilePic || "/default-worker.png"
                            }
                            alt={commentUser?.name || "User"}
                            className="w-6 h-6 rounded-full border object-cover mt-1"
                          />
                          <div className="flex-1 text-xs bg-gray-100 rounded-lg px-2 py-1 relative">
                            <span className="font-medium">{commentUser?.name}: </span>
                            {comment.text}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteComment(selectedJobId, comment.id)}
                                className="absolute top-0 right-0 text-red-500 text-xs"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add comment */}
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
          );
        })}

        {/* Load More */}
        {visibleCount < jobs.length && (
          <div className="text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="text-gray-600 font-medium cursor-pointer"
            >
              <span className="flex gap-2">
                Load more <TfiReload className="mt-1" />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
