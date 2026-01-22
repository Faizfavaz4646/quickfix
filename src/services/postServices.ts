import axios from "axios";
import { API_URL } from "@/lib/constants";
import { Post } from "@/types/post";
import { toast } from "sonner";

const POSTS_ENDPOINT = `${API_URL}/posts`; // Ensure your backend routes are mounted here

export const createPost = async (data: {
  title: string;
  content: string;
  images: string[];
  postType: "job" | "portfolio";
}): Promise<Post | null> => {
  try {
    const response = await axios.post(POSTS_ENDPOINT, data);
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
    const response = await axios.get(POSTS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Fetch feed error:", error);
    return [];
  }
};

export const toggleLikePost = async (postId: string): Promise<Post | null> => {
  try {
    const response = await axios.patch(`${POSTS_ENDPOINT}/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error("Like error:", error);
    return null;
  }
};

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    // Note: Your backend route definition might need a fix to accept /:id
    await axios.delete(`${POSTS_ENDPOINT}/${postId}`);
    toast.success("Post deleted");
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete post");
    return false;
  }
};