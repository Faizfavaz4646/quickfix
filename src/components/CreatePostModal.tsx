"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { FaImage, FaTimes, FaSpinner, FaBriefcase, FaNewspaper } from "react-icons/fa";
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

  /**
   * 🔍 DEBUG LOGS
   * These will run every time the user object changes or the modal opens.
   */
  useEffect(() => {
    if (isOpen) {
      console.log("🛠️ CreatePostModal Debug Info:");
      console.log("👤 Full User Object:", user);
      console.log("🖼️ Path user.profilePic:", (user as any)?.profilePic);
      console.log("🖼️ Path user.profile?.profilePic:", user?.profile?.profilePic);
      console.log("🎭 User Role:", user?.role);
    }
  }, [isOpen, user]);

  /**
   * ✅ ROBUST IMAGE RESOLVER
   * We check the most likely paths for worker and client pictures.
   */
  const getAuthorImage = () => {
    // 1. Try nested profile (Common for Workers)
    if (user?.profile?.profilePic) return user.profile.profilePic;
    
    // 2. Try root level (Common for Clients)
    if ((user as any)?.profilePic) return (user as any).profilePic;

    // 3. Log a warning if nothing is found
    if (isOpen) console.warn("⚠️ No profile picture found in user object, using fallback.");
    
    return "/images/avatar.avif";
  };

  const authorImage = getAuthorImage();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const files = Array.from(e.target.files);
        const uploadPromises = files.map((file) => uploadToCloudinary(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success("Images uploaded");
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
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
      toast.error("Please add some content");
      return;
    }

    setIsSubmitting(true);
    const postType = user?.role === "worker" ? "portfolio" : "job";

    try {
      const newPost = await createPost({
        title,
        content,
        images,
        postType,
      });

      if (newPost) {
        console.log("✅ Post Created Successfully:", newPost);
        if (onPostCreated) onPostCreated(newPost);
        setIsOpen(false);
        setTitle("");
        setContent("");
        setImages([]);
      }
    } catch (error) {
      console.error("Create Post Error:", error);
      toast.error("Error creating post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* 1. TRIGGER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex gap-4 mb-4">
            <img 
                src={authorImage} 
                alt={user.name} 
                className="w-12 h-12 rounded-full object-cover border border-slate-100 bg-slate-50"
                onError={(e) => { 
                  console.log("❌ Trigger Image Error - Path used:", authorImage);
                  e.currentTarget.src = "/images/avatar.avif"; 
                }}
            />
            <button 
                onClick={() => setIsOpen(true)}
                className="flex-1 text-left bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 text-sm font-medium rounded-full px-5 py-3 transition-all duration-200"
            >
                {user.role === 'client' 
                  ? `What's on your mind, ${user.name.split(' ')[0]}?` 
                  : "Showcase your latest work or tools..."}
            </button>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 px-2">
            <div className="flex gap-1 sm:gap-4">
                <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <FaImage className="text-blue-500" />
                    <span className="text-xs font-bold sm:inline">Photo</span>
                </button>
                <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <FaBriefcase className="text-purple-500" />
                    <span className="text-xs font-bold sm:inline">Work</span>
                </button>
            </div>
            
            <button 
              onClick={() => setIsOpen(true)}
              className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black hover:bg-blue-600 transition-colors shadow-md active:scale-95"
            >
              Post
            </button>
        </div>
      </div>

      {/* 2. MODAL POPUP */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="font-black text-xl text-slate-800 tracking-tight">Create Post</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={authorImage} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full object-cover border border-slate-100"
                  onError={(e) => { 
                    console.log("❌ Modal Image Error - Path used:", authorImage);
                    e.currentTarget.src = "/images/avatar.avif"; 
                  }}
                />
                <div>
                  <p className="font-black text-slate-900 text-sm leading-none mb-1">{user.name}</p>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-blue-100">
                      {user.role}
                  </span>
                </div>
              </div>

              <input 
                type="text" 
                placeholder="Add a catchy title..." 
                className="w-full text-xl font-bold placeholder-slate-300 border-none focus:ring-0 px-0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <textarea
                className="w-full min-h-[150px] resize-none border-none focus:ring-0 px-0 text-slate-600 text-base placeholder-slate-300"
                placeholder={user.role === 'worker' ? "Describe the project you finished..." : "Describe the job requirement..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-square group rounded-2xl overflow-hidden border border-slate-100">
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(url)}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-50 flex justify-between items-center">
              <label className={`flex items-center gap-2 text-slate-600 cursor-pointer hover:bg-slate-50 px-4 py-2 rounded-xl transition-all border border-dashed border-slate-200 ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                <FaImage className="text-blue-500 text-lg" />
                <span className="text-xs font-bold">{isUploading ? "Uploading..." : "Add Media"}</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading || !content.trim()}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                {isSubmitting ? <FaSpinner className="animate-spin" /> : "Post Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}