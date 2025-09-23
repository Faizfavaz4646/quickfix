import DashboardCards from "@/components/admin/AdminCard";

export default function AdminDashboard() {
  return (
    <div className="w-full p-4 sm:p-6 lg:-ml-10 lg:p-6">
      {/* Page Title */}

      {/* Content */}
      <div className="w-full">
        <DashboardCards />
      </div>
    </div>
  );
}
