"use client";

import { sendRequestToWorker } from "@/services/jobRequestHelper";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaComments } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ChatBox from "@/components/ChatBox";

export default function RequestDialog({ workerId }: { workerId: string }) {
  const [open, setOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    contact: user?.profile?.phone || "",
    description: "",
  });

  const worker = {
    name: "Saheer Chungath",
    profilePic: "https://res.cloudinary.com/dazg1dppg/image/upload/v1758649928/oqmv5vrwnp2oo9sbb6ol.jpg",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

    setLoading(true);
    try {
      const { newRequest, clientRequest, newNotification } =
        await sendRequestToWorker(
          workerId.toString(),
          user.id.toString(),
          formData.name,
          formData.contact,
          formData.description
        );

      toast.success("Request sent! Worker notified ✅");

      setFormData({
        name: user?.name || "",
        contact: user?.profile?.phone || "",
        description: "",
      });
      setOpen(false);
    } catch (err) {
      console.error("Error sending request:", err);
      toast.error("Failed to send request ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Request button */}
      <button
        onClick={() => {
          if (!user) {
            toast.info("Please login first!");
            router.push("/auth/login");
          } else if (user.role !== "client") {
            toast.error("Only clients can request services!");
          } else {
            setOpen((prev) => !prev);
          }
        }}
        className="bg-yellow-500 text-white px-4 py-2 rounded-md"
      >
        Request Service
      </button>

      {/* Chat button */}
     
            <button
        onClick={() => setShowChat(true)}
        className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 mx-5"
      >
        <FaComments size={20} />
      </button>
  

      {/* Small modal with “page opening” animation */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="requestModal"
            initial={{ opacity: 0, scale: 0.5, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotateX: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-72 z-20"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">Request Service</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="flex flex-col gap-2">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm"
                required
              />
              <input
                type="text"
                name="contact"
                placeholder="Phone Number"
                value={formData.contact}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm"
                required
              />
              <textarea
                name="description"
                placeholder="Describe your request..."
                rows={2}
                value={formData.description}
                onChange={handleChange}
                className="border rounded-md px-2 py-1 text-sm"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? "bg-gray-400" : "bg-yellow-400"
                } text-white py-1.5 rounded-md text-sm`}
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat UI */}
      {showChat && (
        <ChatBox worker={worker} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}
