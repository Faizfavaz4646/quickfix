import axios from "axios";
import { API_URL } from "@/lib/constants";
import { Post } from "@/types/post";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const POSTS_ENDPOINT = `${API_URL}/posts`;

// --- Helper: Robust Token Finder (Same as clientService) ---
const getAuthToken = () => {
  // 1. Try Zustand Memory
  const state = useAuthStore.getState() as any;
  if (state.token) return state.token;
  if (state.user?.token) return state.user.token;

  // 2. Try LocalStorage
  if (typeof window !== "undefined") {
    // Check "quickfix-user" key
    const quickFixData = localStorage.getItem("quickfix-user");
    if (quickFixData) {
      try {
        const parsed = JSON.parse(quickFixData);
        if (parsed.state?.user?.token) return parsed.state.user.token;
        if (parsed.state?.token) return parsed.state.token;
      } catch (e) {
        console.warn("Failed to parse quickfix-user JSON", e);
      }
    }

    // Check standard keys
    const rawToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (rawToken) return rawToken;
    
    // Check "auth-storage"
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.token) return parsed.state.token;
        if (parsed.state?.user?.token) return parsed.state.user.token;
      } catch (e) {}
    }
  }
  return null;
};

// --- API Functions ---

export const createPost = async (data: {
  title: string;
  content: string;
  images: string[];
  postType: "job" | "portfolio";
}): Promise<Post | null> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No token found");

    const response = await axios.post(POSTS_ENDPOINT, data, {
      headers: { Authorization: `Bearer ${token}` }, // ✅ Token Added
    });
    
    toast.success("Post created successfully!");
    return response.data;
  } catch (error) {
    console.error("Create post error:", error);
    toast.error("Failed to create post");
    return null;
  }
};

export const getFeed = async (): Promise<Post[]> => {
  try {
    const token = getAuthToken();
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    
    const response = await axios.get(POSTS_ENDPOINT, config);
    return response.data;
  } catch (error) {
    console.error("Fetch feed error:", error);
    return [];
  }
};

export const toggleLikePost = async (postId: string): Promise<Post | null> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No token found");

    const response = await axios.patch(`${POSTS_ENDPOINT}/${postId}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }, // ✅ Token Added
    });
    return response.data;
  } catch (error) {
    console.error("Like error:", error);
    return null;
  }
};

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No token found");

    await axios.delete(`${POSTS_ENDPOINT}/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }, // ✅ Token Added
    });
    
    toast.success("Post deleted");
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete post");
    return false;
  }
};