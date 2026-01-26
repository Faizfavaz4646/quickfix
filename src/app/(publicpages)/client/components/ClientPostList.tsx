"use client";

import { useEffect, useState } from "react";
import { Post } from "@/types/post"; // Ensure you have this type defined
import { getMyPosts } from "@/services/postServices"; // Adjusted import path
import { deletePost, toggleLikePost } from "@/services/postServices"; // Assuming these exist
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import CommentSection from "@/components/CommentSection";
import { toast } from "sonner";

export default function ClientPostList() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    const data = await getMyPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleDelete = (postId: string) => {
    toast("Delete this post?", {
        action: {
            label: "Delete",
            onClick: async () => {
                const success = await deletePost(postId);
                if(success) setPosts(prev => prev.filter(p => p._id !== postId));
            }
        },
        cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  const handleLike = async (post: Post) => {
    if (!user) return;
    const isLiked = post.likes.includes(user._id);
    const updatedLikes = isLiked 
      ? post.likes.filter(id => id !== user._id)
      : [...post.likes, user._id];
    setPosts(prev => prev.map(p => p._id === post._id ? { ...p, likes: updatedLikes } : p));
    await toggleLikePost(post._id);
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm mt-6">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <ImageIcon size={32} />
        </div>
        <h3 className="text-slate-900 font-bold">No posts yet</h3>
        <p className="text-slate-500 text-sm mt-1">Share your projects or requirements with the community.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-lg font-bold text-slate-900 px-1">My Activity</h3>
      
      {posts.map((post) => {
        const isLiked = user ? post.likes.includes(user._id) : false;

        // PROFILE PIC VISIBILITY LOGIC
        // Priority:
        // 1. Image from the Post object (if backend populated it)
        // 2. Image from the User Store (since it's MY profile)
        // 3. Fallback generic avatar
        const authorData = post.authorId as any;
        
        let authorImage = "/images/avatar.avif"; // Default

        if (authorData?.profilePic) {
            authorImage = authorData.profilePic;
        } else if ((user as any)?.profile?.profilePic) {
            authorImage = (user as any).profile.profilePic;
        } else if ((user as any)?.profilePic) {
            authorImage = (user as any).profilePic;
        }

        return (
          <article key={post._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 flex justify-between items-start">
              <div className="flex gap-3">
                {/* Author Avatar */}
                <img 
                    src={authorImage} 
                    alt="Me" 
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                    onError={(e) => { e.currentTarget.src = "/images/avatar.avif"; }} 
                />
                
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{user?.name || "Me"}</h3>
                  <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
              
              <button onClick={() => handleDelete(post._id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
              {post.title && <h4 className="font-bold text-base mb-2 text-slate-800">{post.title}</h4>}
              <p className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
            </div>

            {/* Images Grid */}
            {post.images && post.images.length > 0 && (
              <div className={`mt-2 grid gap-0.5 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {post.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video bg-slate-100">
                    <img src={img} alt="Post" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="px-2 py-2 border-t border-slate-50 flex items-center justify-between mt-2">
                <button onClick={() => handleLike(post)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors text-sm font-medium ${isLiked ? 'text-red-500 bg-red-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <Heart size={18} className={isLiked ? "fill-current" : ""} /> <span>{post.likes.length > 0 ? post.likes.length : "Like"}</span>
                </button>
                <button onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors text-sm font-medium ${activeCommentPostId === post._id ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <MessageCircle size={18} /> <span>Comment</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-medium">
                    <Share2 size={18} /> <span>Share</span>
                </button>
            </div>

            {/* Comments */}
            <CommentSection 
                postId={post._id} 
                postAuthorId={user?._id || ""} 
                isExpanded={activeCommentPostId === post._id} 
                onToggle={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)} 
            />
          </article>
        );
      })}
    </div>
  );
}