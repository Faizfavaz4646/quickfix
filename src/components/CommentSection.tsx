"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { addComment, getComments, deleteComment } from "@/services/commentService"; // ✅ Checked path
import { Comment } from "@/types/comment"; // ✅ Checked path
import { formatDistanceToNow } from "date-fns";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner"; // ✅ Import Sonner

interface CommentSectionProps {
  postId: string;
  postAuthorId: string;
  isExpanded: boolean; 
  onToggle: () => void; 
}

export default function CommentSection({ 
  postId, 
  postAuthorId, 
  isExpanded, 
  onToggle 
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const data = await getComments(postId);
    setComments(data);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    const added = await addComment(postId, newComment);
    if (added) {
      setComments([added, ...comments]); // Add to top
      setNewComment("");
      // Ensure it stays open after commenting
      if (!isExpanded) onToggle();
    }
    setLoading(false);
  };

  // ✅ UPDATED: Delete with Sonner Confirmation
  const handleDelete = (commentId: string) => {
    toast("Delete this comment?", {
        description: "This cannot be undone.",
        action: {
            label: "Delete",
            onClick: async () => {
                const success = await deleteComment(commentId);
                if (success) {
                    setComments((prev) => prev.filter((c) => c._id !== commentId));
                }
            }
        },
        cancel: { 
            label: "Cancel",
            onClick: () => {}, // Empty function to fix TS error
        }
    });
  };

  // Show only 1 comment if collapsed, all if expanded
  const commentsToDisplay = isExpanded ? comments : comments.slice(0, 1);
  
  // Robust User Image for Input
  const myProfilePic = (user as any)?.profile?.profilePic || (user as any)?.profilePic || "/images/avatar.avif";

  if (comments.length === 0 && !isExpanded) return null;

  return (
    <div className="pt-2">
      
      {/* 1. "View all comments" Trigger */}
      {comments.length > 1 && !isExpanded && (
        <button 
          onClick={onToggle}
          className="text-slate-500 text-sm font-medium mb-2 px-4 hover:text-slate-800 transition-colors"
        >
          View all {comments.length} comments
        </button>
      )}

      {/* 2. Comment List */}
      <div className={`px-4 space-y-3 mb-3 ${isExpanded ? "max-h-96 overflow-y-auto" : ""}`}>
        {commentsToDisplay.map((comment) => {
          const authorData = comment.userId as any;
          const authorImage = authorData?.profile?.profilePic || authorData?.profilePic || "/images/avatar.avif";
          const isMyComment = user?._id === comment.userId._id;
          const isMyPost = user?._id === postAuthorId;
          const canDelete = isMyComment || isMyPost;

          return (
            <div key={comment._id} className="flex gap-3 group items-start">
               {/* Avatar */}
              <img 
                src={authorImage} 
                className="w-8 h-8 rounded-full object-cover border border-slate-100 flex-shrink-0 mt-1"
                alt="User"
                onError={(e) => { 
                   if(e.currentTarget.src.indexOf("/images/avatar.avif") === -1) {
                       e.currentTarget.src = "/images/avatar.avif"; 
                   }
                }}
              />
              
              {/* Content */}
              <div className="flex-1 text-sm">
                <div className="bg-slate-50 px-3 py-2 rounded-2xl rounded-tl-none inline-block">
                    <span className="font-bold text-slate-900 mr-2">{comment.userId.name}</span>
                    <span className="text-slate-700">{comment.text}</span>
                </div>
                
                {/* Meta Row */}
                <div className="flex items-center gap-3 mt-1 ml-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(comment._id)}
                        className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Input Box - ONLY VISIBLE WHEN EXPANDED */}
      {isExpanded && (
        <form onSubmit={handleAddComment} className="p-3 border-t border-slate-100 flex gap-3 bg-white animate-in fade-in slide-in-from-top-1 duration-200">
            <img 
                src={myProfilePic} 
                className="w-8 h-8 rounded-full object-cover border border-slate-100"
                alt="Me"
                onError={(e) => { 
                   if(e.currentTarget.src.indexOf("/images/avatar.avif") === -1) {
                       e.currentTarget.src = "/images/avatar.avif"; 
                   }
                }}
            />
            <div className="flex-1 relative">
                <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-slate-50 border-none focus:bg-white focus:ring-1 focus:ring-slate-200 rounded-full px-4 py-2 text-sm transition-all"
                autoFocus
                />
                {newComment.trim() && (
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="absolute right-2 top-1.5 text-blue-600 hover:text-blue-700 font-bold text-sm disabled:opacity-50"
                    >
                        Post
                    </button>
                )}
            </div>
        </form>
      )}
    </div>
  );
}