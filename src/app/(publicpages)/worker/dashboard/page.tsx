"use client"
import WorkerRating from "@/components/worker/WorkerRating";
import WorkerCompletedJobs from "@/components/worker/WorkerCompletedJobs";
import WorkerProfileCompletation from "@/components/worker/WorkerProfileCompletation";
import WorkerActiveJobs from "@/components/worker/WorkerActiveJobs";
import WorkerNewJobRequest from "@/components/worker/WorkerNewJobRequest";
import WorkerReviews from "@/components/worker/WorkerReviews";
import { useAuthStore } from "@/store/authStore";

export default function WorkerDashboard() {
  const { user } = useAuthStore();

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
        Welcome Back, {user?.name}!
      </h1>

      {/* ===== Main Grid ===== */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <WorkerRating />
        <WorkerCompletedJobs />
        <WorkerNewJobRequest />
        <WorkerProfileCompletation />
        <WorkerActiveJobs />
        <div className="lg:col-span-3">
          <WorkerReviews />
        </div>
      </div>
    </main>
  );
}
