"use client";

import { useEffect, useState } from "react";
import { FaThumbsUp, FaRegThumbsUp, FaTrash, FaCommentAlt } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import { getFeed, toggleLikePost, deletePost } from "../../services/postServices";
import { Post } from "@/types/post";
import CreatePostModal from "@/components/CreatePostModal"; // Adjust import path
import { formatDistanceToNow } from "date-fns"; // Recommend installing: npm i date-fns

export default function PostFeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const data = await getFeed();
    setPosts(data);
    setLoading(false);
  };

  const handlePostCreated = (newPost: Post) => {
    // Add new post to top of list
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = async (post: Post) => {
    if (!user) return;
    
    // Optimistic Update
    const isLiked = post.likes.includes(user._id);
    const updatedLikes = isLiked 
      ? post.likes.filter(id => id !== user._id)
      : [...post.likes, user._id];
    
    setPosts(prev => prev.map(p => p._id === post._id ? { ...p, likes: updatedLikes } : p));

    // API Call
    await toggleLikePost(post._id);
  };

  const handleDelete = async (postId: string) => {
    if(!confirm("Are you sure you want to delete this post?")) return;
    
    const success = await deletePost(postId);
    if (success) {
      setPosts(prev => prev.filter(p => p._id !== postId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Create Post Section */}
        <div className="mb-8 flex justify-end">
          <CreatePostModal onPostCreated={handlePostCreated} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No posts found. Be the first to create one!</p>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post) => {
            const isAuthor = user?._id === post.authorId._id;
            const isLiked = user ? post.likes.includes(user._id) : false;

            return (
              <article key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                
                {/* Post Header */}
                <div className="p-4 flex justify-between items-start">
                  <div className="flex gap-3">
                    <img 
                      src={post.authorId.profile?.profilePic || "/default-avatar.png"} 
                      alt={post.authorId.name} 
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.authorId.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">{post.authorRole}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  {isAuthor && (
                    <button 
                      onClick={() => handleDelete(post._id)}
                      className="text-gray-400 hover:text-red-500 p-2 transition"
                      title="Delete Post"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <div className="px-4 pb-2">
                  {post.title && <h4 className="font-bold text-lg mb-2 text-gray-800">{post.title}</h4>}
                  <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Images Grid */}
                {post.images && post.images.length > 0 && (
                  <div className={`mt-3 grid gap-1 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {post.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt="Post attachment" 
                        className="w-full h-64 object-cover hover:opacity-95 transition cursor-pointer bg-gray-100"
                      />
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-4 py-3 border-t mt-3 flex items-center justify-between">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleLike(post)}
                      className={`flex items-center gap-2 text-sm font-medium transition ${isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                    >
                      {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                      {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                    </button>

                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition">
                      <FaCommentAlt />
                      Comment
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}