"use client";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";

export default function ClientSettings() {
  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold">Account Settings</h1>
       
       {/* Other settings... */}
  
       <ChangePasswordForm />
    </div>
  );
}