"use client";

import React from "react";
import WorkerNavbar from "../worker/navbar/WorkerNavbar";
import WorkerFooter from "../worker/footer/WorkerFooter";

const WorkerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Worker Navbar */}
      <WorkerNavbar />

      {/* Main worker content */}
      <main className="flex-grow bg-gray-50 p-4">{children}</main>

      {/* Worker Footer */}
      <WorkerFooter />
    </div>
  );
};

export default WorkerLayout;
