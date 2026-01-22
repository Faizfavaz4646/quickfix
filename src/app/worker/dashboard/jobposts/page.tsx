"use client";

import { useEffect, useState, useRef } from "react";
import { FaThumbsUp } from "react-icons/fa";
import { TfiReload } from "react-icons/tfi";
import { useAuthStore } from "@/store/authStore";
import {
  fetchJobsForWorkers,
  likeJob,
  unlikeJob,
  commentOnJob,
  deleteComment,
} from "@/services/postServices";
import WorkerNewPost from "@/app/worker/WorkerNewPost";
import { Job, User, Comment } from "@/types/user";
import axios from "axios";
import { API_URL } from "@/lib/constants";

type JobWithClientProfile = Job & {
  likes: string[];
  comments: Comment[];
  clientProfile?: User;
};

export default function WorkerJobPostsPage() {
  const [jobs, setJobs] = useState<JobWithClientProfile[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | number | null>(null);

  // Separate maps
  const [clientsMap, setClientsMap] = useState<Record<string, User>>({});
  const [workersMap, setWorkersMap] = useState<Record<string, User>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const currentUserId = user?.id ? String(user.id) : "";

  // Load jobs + clients + workers
  useEffect(() => {
    const loadJobsAndUsers = async () => {
      setLoading(true);
      try {
        const jobsData = await fetchJobsForWorkers();

        const normalizedJobs: JobWithClientProfile[] = jobsData.map((job) => ({
          ...job,
          likes: Array.isArray(job.likes) ? job.likes.map(String) : [],
          comments: Array.isArray(job.comments) ? job.comments : [],
          clientProfile: job.clientProfile ?? undefined,
        }));
        setJobs(normalizedJobs.reverse());

        // Fetch clients and workers separately
        const [clientsRes, workersRes] = await Promise.all([
          axios.get(`${API_URL}/users`),
          axios.get(`${API_URL}/workers`),
        ]);

        const clients: Record<string, User> = {};
        clientsRes.data.forEach((u: User) => (clients[String(u.id)] = u));
        setClientsMap(clients);

        const workers: Record<string, User> = {};
        workersRes.data.forEach((w: User) => (workers[String(w.id)] = w));
        setWorkersMap(workers);

        console.log("Clients map:", clients);
        console.log("Workers map:", workers);

      } catch (err) {
        console.error("Failed to load jobs/users:", err);
      } finally {
        setLoading(false);
      }
    };

    loadJobsAndUsers();
  }, []);

  // Modal outside click
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

  // Helper: get full user info from correct map
  const getCommentUser = (userId: string) => {
    return clientsMap[userId] || workersMap[userId] || null;
  };

  // Helper: get profile pic
  const getProfilePic = (user?: User | null) => {
    console.log("Fetching profile pic for user:", user);
    if (!user) return "/images/avatar.avif";

    if (user.role === "client") {
      return user.profile?.profilePic || "images/avatar.avif";
    } else {
      return user.profilePic || "/images/avatar.avif";
    }
  };

  // Handle like/unlike
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
    if (!currentUserId || !text.trim()) return;

    const success = await commentOnJob(jobId, currentUserId, text);
    if (!success) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUserId,
      text,
      date: new Date().toISOString(),
    };

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, comments: [...j.comments, newComment] } : j))
    );
    setCommentInputs((prev) => ({ ...prev, [jobId]: "" }));
  };

  // Delete comment
  const handleDeleteComment = async (jobId: string | number, commentId: string | number) => {
    if (!currentUserId || !confirm("Delete comment?")) return;

    try {
      const updatedJob = await deleteComment(jobId, commentId);
      if (updatedJob) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, comments: updatedJob.comments ?? [] } : j))
        );
      }
    } catch (err) {
      console.error(err);
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

  if (loading) return <div className="p-6 text-center w-full">Loading jobs...</div>;
  if (jobs.length === 0) return <div className="p-6 text-center w-full">No jobs available</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <WorkerNewPost />

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {jobs.slice(0, visibleCount).map((job) => {
          const lastComment = job.comments.at(-1);
          const lastCommentUser = lastComment ? getCommentUser(lastComment.userId) : null;

          return (
            <div key={job.id} className="w-full rounded-lg shadow bg-white hover:shadow-lg transition p-4 relative">
              {/* Client Info */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={getProfilePic(job.clientProfile)}
                  alt={job.clientName}
                  className="w-12 h-12 rounded-full border object-cover"
                />
                <p className="font-medium">{job.clientName}</p>
              </div>

              {/* Description */}
              <p className="mb-3 whitespace-pre-line">{job.description}</p>

              {/* Images */}
              {job.images?.length && (
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
                {job.likes.length ? `${job.likes.length} likes` : "No likes yet"}
              </p>

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

              {/* Last comment */}
              {lastComment && (
                <div
                  className="flex items-start gap-2 mt-3 cursor-pointer"
                  onClick={() => openCommentModal(job.id)}
                >
                  <img
                    src={getProfilePic(lastCommentUser)}
                    alt={lastCommentUser?.name || "User"}
                    className="w-8 h-8 rounded-full border object-cover mt-1"
                  />
                  <div className="flex-1 text-sm bg-gray-100 rounded-lg px-2 py-1">
                    <span className="font-medium">{lastCommentUser?.name || "User"}: </span>
                    {lastComment.text}
                    {job.comments.length > 1 && (
                      <span className="text-gray-500 ml-2 text-xs">View all {job.comments.length} comments</span>
                    )}
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

              {/* Comments Modal */}
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
                      const commentUser = getCommentUser(comment.userId);
                      const canDelete = String(comment.userId) === currentUserId;
                      return (
                        <div key={comment.id} className="flex items-start gap-2 mb-2">
                          <img
                            src={getProfilePic(commentUser)}
                            alt={commentUser?.name || "User"}
                            className="w-6 h-6 rounded-full border object-cover mt-1"
                          />
                          <div className="flex-1 text-xs bg-gray-100 rounded-lg px-2 py-1 relative">
                            <span className="font-medium">{commentUser?.name || "User"}: </span>
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
