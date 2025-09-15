import Sidebar from "@/app/(publicpages)/client/components/Sidebar";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* Sidebar stays fixed */}
      <Sidebar />

      {/* Main content changes */}
      <main className="ml-24 md:ml-72 flex-1 p-6">{children}</main>
    </div>
  );
}
