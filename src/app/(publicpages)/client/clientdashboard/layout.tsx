import Sidebar from "@/app/(publicpages)/client/components/Sidebar";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Sidebar is FIXED. It takes up no 'flow' space.
        2. We render it once here for the whole layout.
      */}
      <Sidebar />

      {/* 3. MAIN WRAPPER
        md:ml-64 -> Pushes ALL content 16rem (256px) to the right on desktop.
        This creates the "slot" for the sidebar.
        pt-16 -> Adds top padding on mobile for the mobile header.
      */}
      <main className="transition-all duration-300 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
        
        {/* Your Page Content Goes Here */}
        <div className="flex-1">
          {children}
        </div>

        {/* 4. FOOTER HANDLING:
           If you have a global footer in your Root Layout, it might still overlap.
           The best practice for Dashboards is to put the footer INSIDE this main tag.
           
           If you cannot move your global footer, add this class to it via global CSS:
           footer { @apply md:pl-64; } (Only on dashboard pages)
           
           OR render a specific Dashboard Footer here:
        */}
        <footer className="py-6 text-center text-slate-400 text-xs border-t border-slate-200 mt-auto bg-white">
          © 2026 QuickFix. All rights reserved.
        </footer>
      </main>
    </div>
  );
}