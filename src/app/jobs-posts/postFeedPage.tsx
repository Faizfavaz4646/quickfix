"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { getFeed, toggleLikePost, deletePost, updatePost } from "@/services/postServices";
import { getTopRatedWorkers } from "@/services/workerService";
import { Post } from "@/types/post";
import CreatePostModal from "@/components/CreatePostModal";
import CommentSection from "@/components/CommentSection"; 
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; 
import Link from "next/link"; 
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit3, Check, 
  Star, Search, Wrench, Zap, Droplet, Truck, Paintbrush, BadgeCheck, Loader2, Lock 
} from "lucide-react";

const EDIT_TIME_LIMIT_MINUTES = 60; 

// Interface for Sidebar Data
interface WorkerProfile {
  _id: string;
  name: string;
  profilePic?: string;
  profession?: string;
  rating?: number;
}

export default function PostFeedPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [topWorkers, setTopWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive State
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 1. Only fetch data if User exists
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const feedResponse = await getFeed();
        const feedData = Array.isArray(feedResponse) ? feedResponse : (feedResponse as any).data || [];
        setPosts(feedData);

        try {
          const workersData = await getTopRatedWorkers();
          setTopWorkers(workersData);
        } catch (err) {
          console.error("Failed to load top workers", err);
        }
      } catch (error) {
        console.error("Failed to fetch feed", error);
      } finally {
        setLoading(false);
      }
    };

    if (hasHydrated) {
      fetchData();
    }

    // Click Outside Handler
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hasHydrated, user]);

  // --- Handlers ---
  const handleUpdate = async (postId: string) => {
    if (!editContent.trim()) return;
    setIsUpdating(true);
    try {
      const success = await updatePost(postId, { content: editContent });
      if (success) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, content: editContent } : p));
        setEditingPostId(null);
        toast.success("Post updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (postId: string) => {
    setOpenMenuId(null);
    toast("Delete this post?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          const success = await deletePost(postId);
          if (success) {
             setPosts(prev => prev.filter(p => p._id !== postId));
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
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

  const refreshFeed = async () => {
    const feedResponse = await getFeed();
    const feedData = Array.isArray(feedResponse) ? feedResponse : (feedResponse as any).data || [];
    setPosts(feedData);
  };


  // =========================================================
  // 1. LOADING STATE
  // =========================================================
  if (!hasHydrated) {
    return null;
  }

  // =========================================================
  // 2. 🛑 GUEST VIEW (Access Denied)
  // =========================================================
  if (!user) {
    return (
      <div className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">
            Join the Conversation
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Log in to view the community feed, connect with local professionals, and manage your jobs.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/auth/login" className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              Log In
            </Link>
            <Link href="/auth/signup" className="w-full py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 3. ✅ AUTHENTICATED DASHBOARD
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-24">
               <div className="flex items-center gap-2 mb-4 px-1">
                 <BadgeCheck size={18} className="text-yellow-500 fill-yellow-500" />
                 <h3 className="font-bold text-slate-900 text-sm">Top Rated Pros</h3>
               </div>
               <div className="space-y-4">
                  {topWorkers.length > 0 ? (
                    topWorkers.slice(0, 5).map((worker) => (
                      <Link href={`/client/workerprofile/${worker._id}`} key={worker._id}>
                        <TopWorkerRow name={worker.name} role={worker.profession || "Professional"} rating={worker.rating} image={worker.profilePic} />
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No workers found.</p>
                  )}
               </div>
            </div>
          </div>

          {/* CENTER FEED */}
          <div className="lg:col-span-6 space-y-6">
            <CreatePostModal onPostCreated={refreshFeed} />
            
            {loading ? (
              <div className="space-y-4">
                 {[1,2].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => {
                  const authorData = post.authorId as any;
                  const authorId = typeof post.authorId === 'object' ? authorData?._id : post.authorId;
                  const isAuthor = user?._id === authorId;
                  const isLiked = user ? post.likes.includes(user._id) : false;
                  
                  const minsDiff = differenceInMinutes(new Date(), new Date(post.createdAt));
                  const canEdit = isAuthor && minsDiff < EDIT_TIME_LIMIT_MINUTES;
                  const authorImage = authorData?.profilePic || authorData?.profile?.profilePic || "/images/avatar.avif";
                  const authorName = authorData?.name || "User";

                  return (
                    <article key={post._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                      
                      {/* Post Header */}
                      <div className="p-4 flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="relative w-10 h-10 shrink-0">
                            <img src={authorImage} className="w-full h-full rounded-full object-cover border border-slate-100 bg-slate-50" alt={authorName} onError={(e) => { e.currentTarget.src = "/images/avatar.avif"; }} />
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${post.authorRole === 'worker' ? 'bg-blue-500' : 'bg-green-500'}`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm capitalize">{authorName}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-tight ${post.authorRole === 'worker' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{post.authorRole || "Member"}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <div className="relative" ref={openMenuId === post._id ? menuRef : null}>
                          <button onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors">
                            <MoreHorizontal size={20} />
                          </button>
                          {openMenuId === post._id && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                              {canEdit && (
                                <button onClick={() => { setEditingPostId(post._id); setEditContent(post.content); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                  <Edit3 size={16} className="text-blue-500" /> Edit Post
                                </button>
                              )}
                              {isAuthor && (
                                <button onClick={() => handleDelete(post._id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                                  <Trash2 size={16} /> Delete Post
                                </button>
                              )}
                              {!isAuthor && (
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Report Post</button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="px-4 pb-3">
                        {editingPostId === post._id ? (
                          <div className="space-y-3 bg-slate-50/50 p-3 rounded-xl border border-blue-100">
                            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-white p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows={3} autoFocus />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingPostId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                              <button disabled={isUpdating || !editContent.trim()} onClick={() => handleUpdate(post._id)} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all">
                                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {post.title && <h4 className="font-bold text-base mb-2 text-slate-800">{post.title}</h4>}
                            <p className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
                          </>
                        )}
                      </div>

                      {/* Images */}
                      {post.images && post.images.length > 0 && !editingPostId && (
                        <div className={`mt-2 grid gap-0.5 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {post.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-video bg-slate-100 overflow-hidden">
                              <img src={img} alt="Post" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="px-2 py-2 border-t border-slate-50 flex items-center justify-between mt-2">
                        <button onClick={() => handleLike(post)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors text-sm font-medium ${isLiked ? 'text-red-500 bg-red-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                          <Heart size={18} className={isLiked ? "fill-current" : ""} /> <span>{post.likes.length || "Like"}</span>
                        </button>
                        <button onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors text-sm font-medium ${activeCommentPostId === post._id ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                          <MessageCircle size={18} /> <span>Comment</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-medium">
                          <Share2 size={18} /> <span>Share</span>
                        </button>
                      </div>

                      <CommentSection postId={post._id} postAuthorId={authorId} isExpanded={activeCommentPostId === post._id} onToggle={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)} />
                    </article>
                  );
                })}
                {posts.length === 0 && (
                   <p className="text-center text-slate-400 py-10">No posts yet. Be the first!</p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-24">
              <div className="flex items-center gap-2 mb-4 px-1">
                 <Search size={16} className="text-slate-400" />
                 <h3 className="font-bold text-slate-900 text-sm">Find a Professional</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ServiceMiniCard icon={<Wrench size={16} />} label="HVAC" color="text-blue-500 bg-blue-50" onClick={() => router.push('/client/findworker?query=hvac')} />
                <ServiceMiniCard icon={<Zap size={16} />} label="Electrical" color="text-yellow-500 bg-yellow-50" onClick={() => router.push('/client/findworker?query=electrician')} />
                <ServiceMiniCard icon={<Droplet size={16} />} label="Plumbing" color="text-cyan-500 bg-cyan-50" onClick={() => router.push('/client/findworker?query=plumber')} />
                <ServiceMiniCard icon={<Truck size={16} />} label="Auto" color="text-red-500 bg-red-50" onClick={() => router.push('/client/findworker?query=mechanic')} />
                <ServiceMiniCard icon={<Paintbrush size={16} />} label="Painter" color="text-purple-500 bg-purple-50" onClick={() => router.push('/client/findworker?query=painter')} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ✅ Helpers (No changes needed here)
function ServiceMiniCard({ icon, label, color, onClick }: any) {
    return (
      <button onClick={onClick} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all bg-slate-50/50 cursor-pointer">
        <div className={`p-1.5 rounded-full mb-1.5 ${color}`}>{icon}</div>
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{label}</span>
      </button>
    );
}

function TopWorkerRow({ name, role, rating, image }: any) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
         <img src={image || "/images/avatar.avif"} className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-50" alt={name} onError={(e) => { e.currentTarget.src = "/images/avatar.avif"; }} />
         <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{name}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{role}</p>
         </div>
         <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star size={10} className="fill-yellow-500 text-yellow-500" />
            <span className="text-[10px] font-black text-slate-700">{rating?.toFixed(1) || "5.0"}</span>
         </div>
      </div>
    );
}