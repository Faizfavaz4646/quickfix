"use client";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";

export default function WorkerSettings() {
  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold">Worker Profile & Security</h1>
       
       {/* Worker specific settings... */}

      
       <ChangePasswordForm />
    </div>
  );
}