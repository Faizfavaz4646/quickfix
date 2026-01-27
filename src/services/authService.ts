import axios from "axios";
import { API_URL } from "@/lib/constants";


export const changePassword = async (currentPassword: string, newPassword: string, token: string) => {
  try {
    const response = await axios.patch(
      `${API_URL}/auth/change-password`, // Make sure this matches your route
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to change password";
  }
};