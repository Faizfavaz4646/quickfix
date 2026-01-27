import axios from "axios";
import { API_URL } from "@/lib/constants"; 

// 1. Define the Interface matching your JSON + Population
export interface ReviewData {
  _id: string;
  clientId: {
    _id: string;
    name: string;        // Populated from User model
    profilePic?: string; // Populated from User model
  };
  workerId: string;
  rating: number;
  comment: string;       // Your JSON uses 'comment', not 'review'
  createdAt: string;
}

// 2. Create the Fetch Function
export const getWorkerReviews = async (workerId: string): Promise<ReviewData[]> => {
  try {

    const { data } = await axios.get(`${API_URL}/reviews/worker/${workerId}`);
    return data;
  } catch (error: any) {
    console.error("Error fetching reviews:", error.response?.data || error.message);
    return [];
  }
};