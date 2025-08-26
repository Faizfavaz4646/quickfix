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
  <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    {/* ===== Welcome Header ===== */}
    <div className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
        👋 Welcome Back,{" "}
        <span className="text-yellow-600">{user?.name}!</span>
      </h1>
      <p className="text-sm sm:text-base text-gray-500 mt-1">
        Here’s an overview of your work today.
      </p>
    </div>

    {/* ===== Main Grid ===== */}
    <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Dashboard Cards */}
      <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-4 border-t border-blue-300">
        <WorkerRating />
      </div>

      <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-4 border-t border-blue-300">
        <WorkerCompletedJobs />
      </div>

      <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-4 border-t border-blue-300">
        <WorkerNewJobRequest />
      </div>

      <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-4 border-t border-blue-300">
        <WorkerProfileCompletation />
      </div>

      <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-4 border-t border-blue-300">
        <WorkerActiveJobs />
      </div>

      {/* Reviews Full Width */}
      <div className="lg:col-span-3 bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-4  border-t border-blue-300 ">
        <WorkerReviews />
      </div>
    </div>
  </main>
);
}
