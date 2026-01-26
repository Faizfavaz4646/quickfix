import axios from "axios";
import { API_URL } from "@/lib/constants";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
// 👇 Import the Comment type from your types file
import { Comment } from "@/types/comment"; 

const COMMENTS_ENDPOINT = `${API_URL}/comments`;

// --- Helper: Robust Token Finder ---
const getAuthToken = () => {
  const state = useAuthStore.getState() as any;
  if (state.token) return state.token;
  if (state.user?.token) return state.user.token;
  
  if (typeof window !== "undefined") {
    const rawToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (rawToken) return rawToken;
    
    // Check local storage fallback (optional based on your auth logic)
    const quickFixData = localStorage.getItem("quickfix-user");
    if (quickFixData) {
      try {
        const parsed = JSON.parse(quickFixData);
        if (parsed.state?.user?.token) return parsed.state.user.token;
      } catch (e) {}
    }
  }
  return null;
};

// --- API Functions ---

export const addComment = async (postId: string, text: string): Promise<Comment | null> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No token found");

    const response = await axios.post(
      `${COMMENTS_ENDPOINT}/${postId}`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Add comment error:", error);
    toast.error("Failed to add comment");
    return null;
  }
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const token = getAuthToken();
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${COMMENTS_ENDPOINT}/${postId}`, config);
    return response.data;
  } catch (error) {
    console.error("Get comments error:", error);
    return [];
  }
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No token found");

    await axios.delete(`${COMMENTS_ENDPOINT}/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    toast.success("Comment deleted");
    return true;
  } catch (error) {
    console.error("Delete comment error:", error);
    toast.error("Failed to delete comment");
    return false;
  }
};