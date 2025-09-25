"use client";

import JobPostButton from "@/app/jobs-posts/NewPosts";
import { useAuthStore } from "@/store/authStore";

export default function JobPostWrapper() {
  const { user } = useAuthStore();

  if (!user) return null; // or show a "Login to post a job" message

  return (
    <main className="bg-gray-50">
      <JobPostButton />
    </main>

  )
}
