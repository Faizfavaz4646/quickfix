'use client';

import { sendRequestToWorker } from "@/services/jobRequestHelper";
import { useAuthStore } from "@/types/user";
import { useState } from "react";
import { toast } from "sonner";

export default function RequestDialog({ workerId }: { workerId: number }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.role !== "client") {
      toast.error("Please login as a client to send requests");
      return;
    }

    try {
      const { newRequest, newNotification } = await sendRequestToWorker(
        workerId,
        user.id,
        formData.name,
        formData.contact,
        formData.description
      );

      toast.success("Request sent! Worker notified ✅");
      console.log("Request:", newRequest, "Notification:", newNotification);

      setFormData({ name: "", contact: "", description: "" });
      setOpen(false);
    } catch (err) {
      console.error("Error sending request:", err);
      toast.error("Failed to send request ❌");
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-yellow-500 text-white px-4 py-2 rounded-md"
      >
        Request Service
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-72 z-20">
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
              className="bg-yellow-400 text-white py-1.5 rounded-md text-sm"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
