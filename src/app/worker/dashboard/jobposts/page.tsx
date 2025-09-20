"use client";

import { useEffect, useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import { fetchJobsForWorkers } from "@/services/JobsService";
import { Job, User, Comment } from "@/types/user";

// Extend Job to include optional client profile and safe likes array
export type JobWithClientProfile = Job & {
  likes: string[];
  clientProfile?: User;
};

export default function WorkerJobPostsPage() {
  const [jobs, setJobs] = useState<JobWithClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const allJobs = await fetchJobsForWorkers();

        const jobsWithDefaults: JobWithClientProfile[] = allJobs.map((job) => ({
          ...job,
          likes: Array.isArray(job.likes) ? job.likes.map(String) : [],
          clientProfile: job.clientProfile, // optional
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

  if (loading) return <div className="p-6 text-center">Loading jobs...</div>;
  if (jobs.length === 0) return <div className="p-6 text-center">No jobs available</div>;

  const currentUserId = user?.id ? String(user.id) : "";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold mb-4">All Job Posts</h1>

      {jobs.map((job) => (
        <div
          key={job.id}
          className="border rounded-lg shadow p-4 hover:shadow-md transition bg-white"
        >
          {/* Client Info */}
          <div className="flex items-center gap-3 mb-3">
            {job.clientProfile?.profilePic && (
              <img
                src={job.clientProfile.profilePic}
                alt={job.clientName}
                className="w-12 h-12 rounded-full border"
              />
            )}
            <div>
              <p className="font-medium">{job.clientName}</p>
              <p className="text-sm text-gray-500">
                {job.clientProfile?.state || "Unknown"}, {job.clientProfile?.district || "Unknown"},{" "}
                {job.clientProfile?.city || "Unknown"}
              </p>
            </div>
          </div>

          {/* Job Description */}
          <p className="mb-3 whitespace-pre-line">{job.description}</p>

          {/* Job Images */}
          {job.images?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {job.images.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Job ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Likes info */}
          <p className="text-sm text-gray-500 mb-1">
            {job.likes.length > 0
              ? `${job.likes[job.likes.length - 1]} and ${job.likes.length - 1} others liked`
              : "No likes yet"}
          </p>

          {/* Action buttons */}
          <div className="flex gap-6 border-t pt-2">
            <button
              className={`flex items-center gap-1 text-sm font-medium ${
                job.likes.includes(currentUserId) ? "text-blue-500" : "text-gray-600"
              }`}
            >
              <FaThumbsUp />
              Like
            </button>

            <button className="flex items-center gap-1 text-sm font-medium text-gray-600">
              <FaComment />
              Comment
            </button>
          </div>

          {/* Last comment */}
          {job.comments?.length > 0 && (
            <div className="mt-2 border-t pt-2">
              <p className="text-sm">
                <span className="font-medium">{job.comments[0].userName}: </span>
                {job.comments[0].text}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
