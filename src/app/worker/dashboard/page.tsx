"use client";
import WorkerRating from "@/components/worker/WorkerRating";
import WorkerCompletedJobs from "@/components/worker/WorkerCompletedJobs";
import WorkerProfileCompletation from "@/components/worker/WorkerProfileCompletation";
import WorkerActiveJobs from "@/components/worker/WorkerActiveJobs";
import WorkerNewJobRequest from "@/components/worker/WorkerNewJobRequest";
import WorkerReviews from "@/components/worker/WorkerReviews";
import { useAuthStore } from "@/store/authStore";


export default function WorkerDashboard() {
  const { user } = useAuthStore();
    const userId = user?.id;

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-12 py-10">
      {/* ===== Welcome Header ===== */}
      <div className="flex items-center gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900">
            Welcome Back,{" "}
            <span className="text-blue-600">{user?.name}!</span>
          </h1>
          <p className="text-base text-gray-500 mt-2">
            Here’s an overview of your work today.
          </p>
        </div>
      </div>

      {/* ===== Main Grid ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* === Top Row === */}
        <div className="bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
          <WorkerRating userId={String(userId)} />
        </div>

        <div className="bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
          <WorkerCompletedJobs />
        </div>

        <div className="bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
          <WorkerNewJobRequest />
        </div>

        {/* === Second Row (2 cards) === */}
        <div className="bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
          <WorkerProfileCompletation />
        </div>

        <div className="bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
          <WorkerActiveJobs />
        </div>

        {/* Empty space for balance */}
        <div className="hidden lg:block"></div>

        {/* === Reviews Full Width === */}
 <div className="lg:col-span-3 bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
        
      {userId ? (
        <WorkerReviews userId={String(userId)} />
      ) : (
        <p className="text-sm text-gray-500">No worker data available.</p>
      )}
    </div>


      </div>
    </main>
  );
}
