import axios from "axios";
import { API_URL } from "@/lib/constants";
import { Profile } from "@/types/user"; 

const api = axios.create({ baseURL: API_URL });

/* =====================================================
   CLIENT PROFILE APIs
   ===================================================== */

/**
 * Get the logged-in client's profile
 */
export async function getClientProfile(token: string) {
  try {
    const { data } = await api.get("/client/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Wrap in object structure if your components expect { profile: ... }
    return { profile: data }; 
  } catch (err) {
    console.error("Client profile fetch failed:", err);
    return null;
  }
}

/**
 * Update the logged-in client's profile
 */
export async function updateClientProfile(token: string, formData: any) {
  const { data } = await api.patch("/client/profile", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

/* =====================================================
   WORKER INTERACTION APIs (Client Actions)
   ===================================================== */

/**
 * Search workers by profession and location
 */
export async function searchWorkers(profession: string, location: string) {
  try {
    const { data } = await api.get("/worker/search", {
      params: { profession, location },
    });
    return data ?? [];
  } catch (err) {
    console.error("Search workers failed:", err);
    return [];
  }
}

/**
 * Submit a Rating & Review for a worker
 */
export async function submitRatingAndReview(
  token: string,
  workerId: string,
  jobId: string,
  rating: number,
  review: string
) {
  try {
    const { data } = await api.post(
      "/worker/rate", 
      { workerId, jobId, rating, review },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, data };
  } catch (err) {
    console.error("Rating failed:", err);
    return { success: false, error: err };
  }
}