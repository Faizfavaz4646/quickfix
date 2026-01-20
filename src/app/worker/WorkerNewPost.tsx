"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { FaPencilAlt, FaImage, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Job, Profile } from "@/types/user";
import { postJob } from "@/services/JobsService";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import { getWorkerProfile } from "@/services/workerService";

const WorkerJobPostButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
   const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);

  const { user } = useAuthStore();
    useEffect(() => {
      if (!user?._id) return;
  
      getWorkerProfile(user._id.toString())
        .then((data) => {
          if (data) setWorkerProfile(data);
        })
        .catch((err) => {
          console.error("Failed to fetch worker profile:", err);
        });
    }, [user?._id]);

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
    setImages((prev) => prev.filter((img) => img !== url));
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
      _id: Date.now().toString(),
      clientId: String(user._id),
      clientName: user.name || "Worker",
      profilePic: user?.profile?.profilePic || "/default-avatar.png", // ✅ store worker pic
      description,
      location: user?.profile?.location || user.location || "",
      images,
      date: new Date().toISOString(),
      status: "pending",
      workerId: "",
      likes: [],
      comments: [],
    };

    const success = await postJob(newJob, user._id);
    if (success) {
      setDescription("");
      setImages([]);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-100 text-blue-500 rounded-full hover:bg-blue-50 transition"
      >
        <FaPencilAlt /> Create a Post
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
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>

            {/* Worker Info */}
            <div className="flex items-center gap-3 mb-5">
             
                <img
                  src={workerProfile?.profilePic  || "/default-avatar.png"}
                  alt={user?.name}
                  className="w-12 h-12 rounded-full border object-cover"
                />
              <span className="font-medium text-gray-700 text-lg">
                {user?.name || "Worker"}
              </span>
            </div>

            {/* Textarea */}
            <textarea
              className="w-full rounded-lg p-4 focus:ring-0 text-base outline-none resize-none"
              placeholder="make your post here..."
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

export default WorkerJobPostButton;
