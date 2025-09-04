"use client";
import { useAuthStore } from "@/store/authStore";
import DashboardSummary from "@/app/(publicpages)/client/components/DashboardSummary";
import JobCard from "@/app/(publicpages)/client/components/JobTabs";
import ReviewModal from "@/app/(publicpages)/client/components/ReviewModal";
import { useState } from "react";

export default function ClientDashboard() {
  const { user, activeJobs, completedJobs } = useAuthStore();
  const requests = user?.profile?.requests ?? [];

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleReviewSubmit = (rating: number, review: string) => {
    console.log("Review submitted:", { rating, review });
    // TODO: patch client + worker in backend
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto px-4 py-8">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Client Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Track your service requests, jobs in progress, and completed work.
          </p>
        </div>

        {/* Summary Cards */}
        <DashboardSummary
          total={requests.length + activeJobs.length + completedJobs.length}
          pending={requests.length}
          inProgress={activeJobs.length}
          completed={completedJobs.length}
        />

        {/* Service Requests */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Service Requests
          </h2>
          {requests.length + activeJobs.length + completedJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No service requests found.
            </p>
          ) : (
            <div className="grid gap-4">
              {requests.map((req) => (
                <JobCard
                  key={req.id}
                  title={req.description}
                  description={`Requested by ${req.name ?? "You"}`}
                  status="pending"
                  actionLabel="Cancel"
                />
              ))}
              {activeJobs.map((job) => (
                <JobCard
                  key={job.id}
                  title={job.description}
                  description="Ongoing job"
                  status="ongoing"
                  actionLabel="Contact Worker"
                />
              ))}
              {completedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  title={job.description ?? job.name}
                  description={`Completed job`}
                  status="completed"
                  actionLabel="Rate"
                  onAction={() => setReviewModalOpen(true)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer (fixed layout) */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white">QuickFix</h3>
            <p className="text-sm mt-2">
              Your go-to platform to find reliable local workers like
              electricians, plumbers, and more.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 mt-2 text-sm">
              <li>Home</li>
              <li>Find a Professional</li>
              <li>Join as Worker</li>
              <li>About Us</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white">Contact Us</h4>
            <p className="text-sm mt-2">📧 support@quickfix.com</p>
            <p className="text-sm">📞 +91 7034514646</p>
            <p className="text-sm">📍 Calicut, India</p>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm mt-6">
          © 2025 QuickFix. All rights reserved.
        </div>
      </footer>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
