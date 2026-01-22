"use client";

import { useState, ChangeEvent } from "react";
import { FaImage, FaTimes, FaSpinner, FaBriefcase, FaVideo, FaNewspaper } from "react-icons/fa";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { createPost } from "@/services/postServices";
import { uploadToCloudinary } from "utils/uploadToCloudinary"; 
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
      {/* --- PROFESSIONAL TRIGGER CARD (LinkedIn Style) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 w-full">
        <div className="flex gap-3 mb-3">
            <img 
                src={user.profile?.profilePic || "/default-avatar.png"} 
                alt={user.name} 
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <button 
                onClick={() => setIsOpen(true)}
                className="flex-1 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 font-medium rounded-full px-5 py-3 transition-colors duration-200"
            >
                {user.role === 'client' ? "Post a job requirement..." : "Share your latest work..."}
            </button>
        </div>
        
        <div className="flex justify-between items-center pt-2 px-2">
            <div className="flex gap-1 sm:gap-4">
                <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <FaImage className="text-blue-500 text-lg" />
                    <span className="text-sm font-semibold text-gray-600">Media</span>
                </button>
                <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <FaBriefcase className="text-purple-500 text-lg" />
                    <span className="text-sm font-semibold text-gray-600">Job</span>
                </button>
                <button onClick={() => setIsOpen(true)} className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <FaNewspaper className="text-orange-500 text-lg" />
                    <span className="text-sm font-semibold text-gray-600">Article</span>
                </button>
            </div>
        </div>
      </div>

      {/* --- MODAL POPUP --- */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="font-bold text-xl text-gray-800">
                  {user.role === 'client' ? "Create Job Post" : "Add to Portfolio"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <img 
                  src={user.profile?.profilePic || "/default-avatar.png"} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium border border-gray-200 capitalize">
                        {user.role}
                    </span>
                    <span className="text-xs text-gray-400">Public</span>
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <input 
                type="text" 
                placeholder="Title (e.g. Broken Pipe in Kitchen)" 
                className="w-full text-lg font-bold placeholder-gray-400 border-none focus:ring-0 px-0 mt-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <textarea
                className="w-full min-h-[150px] resize-none border-none focus:ring-0 px-0 text-gray-600 text-base"
                placeholder={`What are the details? Location, timing, requirements...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-24 h-24 group rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
              <label className={`flex items-center gap-2 text-gray-600 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                <FaImage className="text-blue-500 text-xl" />
                <span className="text-sm font-medium">{isUploading ? "Uploading..." : "Add Photos"}</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading || !content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
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