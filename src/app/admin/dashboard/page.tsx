import DashboardCards from "@/components/admin/AdminCard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardHeader from "@/components/admin/DashboardHeader";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <DashboardHeader />
        {/* Container to keep cards aligned nicely */}
        <div className="w-full max-w-screen-xl mx-auto">
          <DashboardCards />
        </div>
      </main>
    </div>
  );
}