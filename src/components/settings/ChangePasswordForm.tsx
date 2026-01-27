"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { changePassword } from "@/services/authService"; // Import from step 1
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Lock, Check } from "lucide-react";

export default function ChangePasswordForm() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Visibility Toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    // 1. Validation
    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      toast.error("New password cannot be the same as old password");
      return;
    }

    // 2. API Call
    setLoading(true);
    try {
      await changePassword(formData.currentPassword, formData.newPassword, token);
      
      toast.success("Password changed successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-xl">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Change Password</h2>
      <p className="text-sm text-slate-500 mb-6">
        Ensure your account is using a long, random password to stay secure.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase">Confirm Password</label>
          <div className="relative">
            <Check className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 py-2.5 bg-slate-50 border rounded-lg text-sm focus:ring-2 outline-none transition-all
                ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword 
                  ? "border-red-300 focus:ring-red-500" 
                  : "border-slate-200 focus:ring-blue-500"}`}
              placeholder="Confirm new password"
              required
            />
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
             <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading || !formData.currentPassword || !formData.newPassword}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
          </button>
        </div>

      </form>
    </div>
  );
}