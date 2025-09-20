import DashboardCards from "@/components/admin/AdminCard";
import DashboardHeader from "@/components/admin/DashboardHeader";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Main Content */}
      <main className="ml-0 sm:ml-64 flex-1 p-6 transition-all duration-300">
       <DashboardHeader />
        <div className="w-full max-w-screen-xl mx-auto">
          <DashboardCards />
        </div>
      </main>
    </div>
  );
}
