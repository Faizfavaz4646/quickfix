"use client";

import { sendRequestToWorker } from "@/services/clientService"; 
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaComments, FaPaperPlane, FaTimes, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ChatBox from "@/components/ChatBox";

export default function RequestDialog({ workerId, workerName, workerPic }: { workerId: string, workerName?: string, workerPic?: string }) {
  const [open, setOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
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

  const workerObj = {
    _id: workerId,
    name: workerName || "Worker",
    profilePic: workerPic || "",
  };

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
      
      setFormData(prev => ({
          ...prev, 
          title: "", 
          description: "", 
          scheduledDate: ""
      }));
    } catch (err: any) {
      console.error("Error sending request:", err);
      toast.error(err.response?.data?.message || "Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClick = () => {
    if (!user) {
      toast.info("Please login to request services.");
      router.push("/auth/login");
    } else if (user.role !== "client") {
      toast.error("Only client accounts can hire workers.");
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="relative flex flex-col sm:flex-row gap-3 w-full">
      
      {/* 1. Request Button */}
      <button
        onClick={handleOpenClick}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span>Request Service</span>
        <FaPaperPlane className="text-sm opacity-80" />
      </button>

      {/* 2. Chat Button */}
      <button
        onClick={() => {
           if (!user) {
             toast.info("Please login to chat.");
             router.push("/auth/login");
             return;
           }
           setShowChat(true);
        }}
        className="px-6 py-3.5 rounded-xl font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all flex items-center justify-center gap-2"
      >
        <FaComments size={20} />
        Chat
      </button>

      {/* --- Request Modal --- */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
               onClick={() => setOpen(false)}
            />
            
            {/* Modal Content - CENTERED ON SCREEN */}
            <motion.div
              key="requestModal"
              // Center the modal using fixed positioning and percentage transforms
              initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }} 
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 w-[95%] sm:w-[450px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Hire {workerName}</h3>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Job Request Form</p>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <FaTimes size={14} />
                </button>
              </div>

              <form onSubmit={handleSendRequest} className="flex flex-col gap-4">
                
                {/* 1. Job Title */}
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
                    minLength={3}
                  />
                </div>

                {/* 2. Phone Number */}
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
                    title="Please enter a valid 10-digit phone number"
                  />
                </div>

                {/* 3. Address & Date Row */}
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

                {/* 4. Full Address */}
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
                            minLength={5}
                        />
                         <FaMapMarkerAlt className="absolute left-2.5 top-3 text-slate-400 text-sm" />
                    </div>
                </div>

                {/* 5. Description */}
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
                    minLength={10}
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

      {/* Chat UI */}
      {showChat && (
        <ChatBox worker={workerObj} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}