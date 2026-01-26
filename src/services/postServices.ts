import axios from "axios";
import { API_URL } from "@/lib/constants";
import { Post } from "@/types/post";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

// ✅ Create a specialized instance for Posts
const postApi = axios.create({
  baseURL: `${API_URL}/posts`,
});

/**
 *  Centralized Interceptor
 * Automatically finds the token from Zustand or LocalStorage 
 * and attaches it to every request header.
 */
postApi.interceptors.request.use((config) => {
  // 1. Try to get token from active Zustand state
  const state = useAuthStore.getState() as any;
  let token = state.user?.token || state.token;

  // 2. Fallback: Check LocalStorage if the store hasn't hydrated yet
  if (!token && typeof window !== "undefined") {
    const storageData = localStorage.getItem("quickfix-user");
    if (storageData) {
      try {
        const parsed = JSON.parse(storageData);
        token = parsed.state?.user?.token || parsed.state?.token;
      } catch (e) {
        console.error("Auth storage parse error", e);
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- API Functions ---

export const getFeed = async (): Promise<Post[]> => {
  try {
    // Hits: GET http://localhost:5001/posts
    const { data } = await postApi.get("/");
    return data;
  } catch (error: any) {
    console.error("Fetch feed error:", error.response?.status);
    // If feed is public, the 401 might be coming from a strict backend middleware
    return [];
  }
};

export const getMyPosts = async (): Promise<Post[]> => {
  try {
    const { data } = await postApi.get("/me");
    return data;
  } catch (error) {
    console.error("Failed to fetch personal posts", error);
    return [];
  }
};

export const createPost = async (postData: {
  title: string;
  content: string;
  images: string[];
  postType: "job" | "portfolio";
}): Promise<Post | null> => {
  try {
    const { data } = await postApi.post("/", postData);
    toast.success("Post published successfully!");
    return data;
  } catch (error) {
    toast.error("Failed to create post");
    return null;
  }
};

export const updatePost = async (postId: string, contentData: { content: string }): Promise<boolean> => {
  try {
    await postApi.patch(`/${postId}`, contentData);
    toast.success("Post updated");
    return true;
  } catch (error) {
    toast.error("Failed to update post");
    return false;
  }
};

export const toggleLikePost = async (postId: string): Promise<Post | null> => {
  try {
    const { data } = await postApi.patch(`/${postId}/like`);
    return data;
  } catch (error) {
    console.error("Like action failed", error);
    return null;
  }
};

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    await postApi.delete(`/${postId}`);
    toast.success("Post removed");
    return true;
  } catch (error) {
    toast.error("Could not delete post");
    return false;
  }
};