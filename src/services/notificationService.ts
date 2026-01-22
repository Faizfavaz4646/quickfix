import axios from "axios";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { Notification } from "@/types/notification";

// Helper to get token (Reuse your existing logic)
const getAuthToken = () => {
  const state = useAuthStore.getState() as any;
  return state.token || localStorage.getItem("token");
};

export const getMyNotifications = async (): Promise<Notification[]> => {
  try {
    const token = getAuthToken();
    const { data } = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return [];
  }
};

export const markNotificationAsRead = async (id: string): Promise<Notification | null> => {
  try {
    const token = getAuthToken();
    const { data } = await axios.patch(
      `${API_URL}/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error("Mark read error:", error);
    return null;
  }
};