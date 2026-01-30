"use client";

import { sendRequestToWorker } from "@/services/clientService"; 
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaVideo, FaPaperPlane, FaTimes, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa"; // Changed FaComments to FaVideo
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/constants";

// ✅ Helper to robustly fix image URLs
const getImageUrl = (path?: string) => {
  if (!path) return "/images/avatar.avif";
  if (path.startsWith("http") || path.startsWith("https")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_URL}/${cleanPath}`
};

export default function RequestDialog({ workerId, workerName, workerPic }: { workerId: string, workerName?: string, workerPic?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: user?.profile?.address || "", 
    scheduledDate: "",
    clientPhone: user?.profile?.phone || "",
    city: user?.profile?.city || "",
    state: user?.profile?.state || ""
  });

  const fixedWorkerPic = getImageUrl(workerPic);

  // --- 🎥 VIDEO CALL LOGIC ---
  const handleVideoCall = () => {
    if (!user) {
      toast.info("Please login to video call.");
      router.push("/auth/login");
      return;
    }

    // 1. Create a Deterministic Room ID
    // Logic: Sort IDs so "Client+Worker" is always the same string as "Worker+Client"
    // This ensures they always land in the same room.
    const ids = [user._id, workerId].sort(); 
    const roomId = `call-${ids[0]}-${ids[1]}`;

    // 2. Redirect to the Call Page
    router.push(`/call/${roomId}`);
  };
  // ---------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login first!");
      router.push("/auth/login");
      return;
    }
    if (user.role !== "client") {
      toast.error("Only clients can send requests!");
      return;
    }
    if (new Date(formData.scheduledDate) <= new Date()) {
        toast.error("Scheduled date must be in the future");
        return;
    }

    setLoading(true);
    try {
      await sendRequestToWorker(
          workerId.toString(),
          user._id.toString(),
          {
            title: formData.title,
            description: formData.description,
            address: formData.address,
            scheduledDate: formData.scheduledDate,
            clientPhone: formData.clientPhone,
            city: formData.city,
            state: formData.state
          }
        );

      toast.success("Request sent successfully! Worker notified.");
      setOpen(false);
      setFormData(prev => ({ ...prev, title: "", description: "", scheduledDate: "" }));
    } catch (err: any) {
      console.error("Error sending request:", err);
      toast.error(err.response?.data?.message || "Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col sm:flex-row gap-3 w-full">
      
      {/* REQUEST BUTTON */}
      <button
        onClick={() => user ? setOpen(true) : router.push("/auth/login")}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span>Request Service</span>
        <FaPaperPlane className="text-sm opacity-80" />
      </button>

      {/* 🎥 VIDEO CALL BUTTON */}
      <button
        onClick={handleVideoCall}
        className="px-6 py-3.5 rounded-xl font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
      >
        <FaVideo size={20} />
        Video Call
      </button>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
               onClick={() => setOpen(false)}
            />
            
            <motion.div
              key="requestModal"
              initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }} 
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 w-[95%] sm:w-[450px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-50 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-5 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img 
                    src={fixedWorkerPic} 
                    alt={workerName} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-100"
                    onError={(e) => (e.currentTarget.src = "/images/avatar.avif")}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">Hire {workerName}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Job Request Form</p>
                  </div>
                </div>

                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <FaTimes size={14} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSendRequest} className="flex flex-col gap-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Kitchen Sink Repair"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Phone <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50"
                    required
                    pattern="[0-9]{10}"
                  />
                </div>

                {/* Date */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type="datetime-local"
                                name="scheduledDate"
                                value={formData.scheduledDate}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50 pl-8"
                                required
                            />
                            <FaCalendarAlt className="absolute left-2.5 top-2.5 text-slate-400 text-xs" />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location / Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <textarea
                            name="address"
                            rows={2}
                            placeholder="House No, Street, Landmark..."
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50 pl-8 resize-none"
                            required
                        />
                         <FaMapMarkerAlt className="absolute left-2.5 top-3 text-slate-400 text-sm" />
                    </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    name="description"
                    placeholder="Describe the issue in detail..."
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50 resize-none"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? "Sending Request..." : "Confirm & Send Request"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}