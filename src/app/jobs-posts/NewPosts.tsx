"use client";

import { useState, ChangeEvent } from "react";
import { FaPencilAlt, FaImage, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Job } from "@/types/user";
import { postJob } from "@/services/postServices";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";

const JobPostButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]); // multiple image URLs
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useAuthStore();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setIsUploading(true);

      try {
        const uploadedUrls: string[] = [];
        for (const file of files) {
          const url = await uploadToCloudinary(file);
          uploadedUrls.push(url);
        }
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success("Images uploaded!");
      } catch (err) {
        toast.error("Failed to upload images");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = (url: string) => {
    setImages(images.filter((img) => img !== url));
  };

  const handlePost = async () => {
    if (!description) {
      toast.error("Please enter job description!");
      return;
    }

    if (!user?._id) {
      toast.error("You must be logged in to post a job.");
      return;
    }

    const newJob: Job = {
      id: Date.now(),
      clientId: String(user?._id),
      clientName: user?.name || "Anonymous",
      description,
      location: user?.location,
      images, //  store multiple images
      date: new Date().toISOString(),
      status: "pending",
      workerId: "",
      likes: [], 
      comments: [],
    };

    try {
      await postJob(newJob, user.id);
      toast.success("Job posted!");
      setDescription("");
      setImages([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Job post failed");
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border-2  border-gray-100 text-blue-500 rounded-full hover:bg-blue-50 transition"
      >
        <FaPencilAlt /> Post a Job
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8 relative mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>

            {/* User info */}
            <div className="flex items-center gap-3 mb-5">
              {user?.profile?.profilePic && (
                <img
                  src={user.profile.profilePic}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border"
                />
              )}
              <span className="font-medium text-gray-700 text-lg">
                {user?.name || "Client"}
              </span>
            </div>

            {/* Textarea */}
            <textarea
              className="w-full rounded-lg p-4 focus:ring-0 text-base outline-none resize-none"
              placeholder="Describe the job..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />

            {/* Images Preview */}
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((url) => (
                  <div key={url} className="relative w-32 h-32">
                    <img
                      src={url}
                      alt="Job"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center mt-6">
              <label className="cursor-pointer flex items-center gap-2 text-gray-600 group">
                <FaImage className="text-gray-500 group-hover:text-blue-500 text-xl" />
                <span className="opacity-0 group-hover:opacity-100 transition text-sm">
                  {isUploading ? "Uploading..." : "Add Photos"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>

              <button
                onClick={handlePost}
                disabled={isUploading}
                className="bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobPostButton;
