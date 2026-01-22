"use client";

import { useState, ChangeEvent } from "react";
import { FaPencilAlt, FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { createPost } from "@/services/postService";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { Post } from "@/types/post";

interface CreatePostModalProps {
  onPostCreated?: (newPost: Post) => void;
}

export default function CreatePostModal({ onPostCreated }: CreatePostModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const files = Array.from(e.target.files);
        const uploadPromises = files.map((file) => uploadToCloudinary(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        setImages((prev) => [...prev, ...uploadedUrls]);
      } catch (err) {
        toast.error("Failed to upload images");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = (urlToRemove: string) => {
    setImages(images.filter((url) => url !== urlToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please add some content to your post");
      return;
    }

    setIsSubmitting(true);
    
    // Determine post type based on role or allow selection
    // For now, defaulting Client -> Job, Worker -> Portfolio
    const postType = user?.role === "worker" ? "portfolio" : "job";

    const newPost = await createPost({
      title,
      content,
      images,
      postType,
    });

    if (newPost) {
      if (onPostCreated) onPostCreated(newPost);
      setIsOpen(false);
      setTitle("");
      setContent("");
      setImages([]);
    }
    setIsSubmitting(false);
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md font-medium"
      >
        <FaPencilAlt /> 
        {user.role === 'client' ? "Post a Job" : "Add to Portfolio"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-semibold text-lg text-gray-800">Create Post</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <img 
                  src={user.profile?.profilePic || "/default-avatar.png"} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>

              {/* Inputs */}
              <input 
                type="text" 
                placeholder="Post Title (Optional)" 
                className="w-full text-lg font-medium placeholder-gray-400 border-none focus:ring-0 px-0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <textarea
                className="w-full min-h-[120px] resize-none border-none focus:ring-0 px-0 text-gray-600"
                placeholder={`What needs to be done? Describe the ${user.role === 'client' ? 'job' : 'work'}...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-24 h-24 group">
                      <img src={url} alt="preview" className="w-full h-full object-cover rounded-lg" />
                      <button 
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-between items-center bg-gray-50">
              <label className={`flex items-center gap-2 text-gray-600 cursor-pointer hover:text-blue-600 transition ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                <FaImage className="text-xl" />
                <span className="text-sm font-medium">{isUploading ? "Uploading..." : "Add Photos"}</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading || !content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <FaSpinner className="animate-spin" />}
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}