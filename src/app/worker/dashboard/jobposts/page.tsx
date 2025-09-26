"use client";

import { useEffect, useState, useRef } from "react";
import { FaThumbsUp } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import {
  fetchJobsForWorkers,
  likeJob,
  unlikeJob,
  commentOnJob,
  deleteComment,
} from "@/services/JobsService";
import WorkerNewPost from "@/app/worker/WorkerNewPost";
import { Job, User, Comment } from "@/types/user";

type JobWithClientProfile = Job & {
  likes: string[];
  comments: Comment[];
  clientProfile?: User | any;
};

export default function WorkerJobPostsPage() {
  const [jobs, setJobs] = useState<JobWithClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | number | null>(null);

  const { user } = useAuthStore();
  const currentUserId = user?.id ? String(user.id) : "";
  const currentUserName = user?.name || "";
  const modalRef = useRef<HTMLDivElement>(null);

  const getProfilePic = () =>
    user?.profile?.profilePic || user?.profilePic || "/images/avatar.avif";

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const allJobs = await fetchJobsForWorkers();
        const normalized: JobWithClientProfile[] = allJobs.map((job) => ({
          ...job,
          likes: Array.isArray(job.likes) ? job.likes.map(String) : [],
          comments: Array.isArray(job.comments) ? job.comments : [],
          clientProfile: job.clientProfile ?? undefined,
        }));
        setJobs(normalized.reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalOpen(false);
        setSelectedJobId(null);
      }
    };
    if (modalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  const handleLike = async (jobId: string | number) => {
    if (!currentUserId) return;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const hasLiked = job.likes.includes(currentUserId);
    const success = hasLiked
      ? await unlikeJob(jobId, currentUserId)
      : await likeJob(jobId, currentUserId);
    if (!success) return;

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
  };

  const handleCommentSubmit = async (jobId: string | number) => {
    if (!currentUserId) return;
    const key = String(jobId);
    const text = (commentInputs[key] || "").trim();
    if (!text) return;

    const success = await commentOnJob(jobId, currentUserId, text);
    if (!success) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUserName,
      clientName: currentUserName,
      text,
      date: new Date().toISOString(),
      profilePic: getProfilePic(),
    };

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, comments: [...j.comments, newComment] } : j))
    );

    setCommentInputs((prev) => ({ ...prev, [key]: "" }));
  };

  const handleDeleteComment = async (jobId: string | number, commentId: string | number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const updatedJob = await deleteComment(jobId, commentId);
    if (updatedJob) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, comments: updatedJob.comments ?? [] } : j))
      );
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
  if (!loading && jobs.length === 0)
    return <div className="p-6 text-center w-full">No jobs available</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <WorkerNewPost />

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {jobs.map((job) => {
          const jobKey = String(job.id);
          const lastComment = job.comments[job.comments.length - 1];

          return (
            <div
              key={jobKey}
              className="w-full rounded-lg shadow bg-white hover:shadow-lg transition p-4 relative"
            >
              {/* Client info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <img
                  src={job.clientProfile?.profilePic || "/images/avatar.avif"}
                  alt={job.clientName}
                  className="w-12 h-12 rounded-full border object-cover"
                />
                <div>
                  <p className="font-medium">{job.clientName}</p>
                  <p className="text-sm text-gray-500">
                    {job.clientProfile?.state || "Unknown"},{" "}
                    {job.clientProfile?.district || "Unknown"},{" "}
                    {job.clientProfile?.city || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="mb-3 whitespace-pre-line">{job.description}</p>

              {/* Images */}
           {job.images?.length ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
    {(job.images || []).map((img, idx) => (
      <img
        key={idx}
        src={img}
        alt={`Job ${idx + 1}`}
        className="w-full h-48 object-cover rounded-lg"
      />
    ))}
  </div>
) : null}


              {/* Likes */}
              <p className="text-sm text-gray-500 mb-1">
                {job.likes.length > 0 ? `${job.likes.length} people liked this` : "No likes yet"}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => handleLike(job.id)}
                  className={`flex items-center gap-1 text-sm font-medium ${
                    job.likes.includes(currentUserId) ? "text-blue-500" : "text-gray-600"
                  }`}
                >
                  <FaThumbsUp /> Like
                </button>
              </div>

              {/* Latest Comment */}
              {lastComment && (
                <div
                  className="flex items-start gap-2 mt-2 cursor-pointer"
                  onClick={() => openCommentModal(job.id)}
                >
                  <img
                    src={lastComment.profilePic || "/images/avatar.avif"}
                    alt={lastComment.userName}
                    className="w-6 h-6 rounded-full border object-cover mt-1"
                  />
                  <div className="flex-1 text-sm bg-gray-100 rounded-lg px-2 py-1">
                    <span className="font-medium">{lastComment.userName}: </span>
                    {lastComment.text}
                  </div>
                  {job.comments.length > 1 && (
                    <span className="text-gray-500 text-xs ml-2 mt-1">
                      View all {job.comments.length} comments
                    </span>
                  )}
                </div>
              )}

              {/* Comments Modal */}
              {modalOpen && selectedJobId === job.id && (
                <div
                  ref={modalRef}
                  className="mt-2 w-full bg-white border shadow-lg rounded-lg max-h-64 overflow-y-auto z-10 p-3"
                >
                  <h3 className="text-sm font-medium mb-2">All Comments</h3>
                  {selectedJobComments.length === 0 && (
                    <p className="text-xs text-gray-500">No comments yet</p>
                  )}
                  {selectedJobComments.map((comment) => {
                    const canDelete = String(comment.userId) === currentUserId;
                    return (
                      <div key={comment.id} className="flex items-start gap-2 mb-2">
                        <img
                          src={comment.profilePic || "/images/avatar.avif"}
                          alt={comment.userName}
                          className="w-6 h-6 rounded-full border object-cover mt-1"
                        />
                        <div className="flex-1 text-xs bg-gray-100 rounded-lg px-2 py-1 relative">
                          <span className="font-medium">{comment.userName}: </span>
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
              )}

              {/* Comment Input */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  id={`comment-input-${jobKey}`}
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[jobKey] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({ ...prev, [jobKey]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCommentSubmit(job.id);
                  }}
                  className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                  onClick={() => handleCommentSubmit(job.id)}
                  className="text-blue-500 font-medium text-sm"
                >
                  Post
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
