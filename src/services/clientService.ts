// src/services/clientService.ts

import axios from "axios";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({ baseURL: API_URL });

// --- Helper: Robust Token Finder (Updated for your nesting) ---
const getAuthToken = () => {
  const state = useAuthStore.getState() as any;
  if (state.token) return state.token;
  if (state.user?.token) return state.user.token;

  if (typeof window !== "undefined") {
    const quickFixData = localStorage.getItem("quickfix-user");
    if (quickFixData) {
      try {
        const parsed = JSON.parse(quickFixData);
        if (parsed.state?.user?.token) return parsed.state.user.token;
        if (parsed.state?.token) return parsed.state.token;
      } catch (e) {}
    }
    const rawToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (rawToken) return rawToken;
  }
  return null;
};

/* =====================================================
   CLIENT PROFILE APIs
   ===================================================== */
export async function getClientProfile(token: string) {
  try {
    const { data } = await api.get("/client/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // ✅ FIX: Backend already returns { profile: ... }, so just return data
    return data; 
  } catch (err) {
    console.error("Client profile fetch failed:", err);
    return null;
  }
}

export async function updateClientProfile(token: string, formData: any) {
  const { data } = await api.patch("/client/profile", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

/* =====================================================
   WORKER INTERACTION APIs
   ===================================================== */
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

export async function submitRatingAndReview(
  token: string,
  workerId: string,
  jobId: string,
  rating: number,
  review: string // We accept "review" as the argument name...
) {
  try {
    // ✅ FIX: Change the URL to /reviews (standard) and map 'review' to 'comment'
    const { data } = await api.post(
      "/reviews", 
      { 
        workerId, 
        jobId, 
        rating, 
        comment: review // 👈 IMPORTANT: Backend expects "comment", not "review"
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, data };
  } catch (err) {
    console.error("Rating failed:", err);
    return { success: false, error: err };
  }
}

export async function getWorkerProfile(workerId: string) {
  try {
    // 1. Fetch the worker profile using the User ID
    // This call works fine (Status 200)
    const { data } = await api.get(`/worker`, {
      params: { userId: workerId }
    });

    // Handle whether backend returns an Array [obj] or just the Object
    const worker = Array.isArray(data) ? data[0] : data;
    
    if (!worker) return null;

    // ❌ REMOVED: The nested try/catch block fetching `/users/...`
    // Reason: It was causing 404s and is unnecessary because 'worker' already has the data.

    // 2. Return a normalized object
    // We prioritize the root fields (which contain your Cloudinary URL)
    return {
      ...worker,
      // If name is at root, use it. Otherwise check nested userId object.
      name: worker.name || worker.userId?.name || "Service Provider",
      
      // If email is at root, use it. Otherwise check nested userId object.
      email: worker.email || worker.userId?.email || "Contact Hidden",
      
      // ✅ FIX: Use the root profilePic (Cloudinary) first. 
      profilePic: worker.profilePic || worker.userId?.profilePic || null
    };

  } catch (err) {
    console.error("Failed to fetch worker profile:", err);
    return null;
  }
}
export async function sendRequestToWorker(
  workerId: string,
  clientId: string, // (Note: Backend uses token for ID, but we keep this param for consistency)
  data: {
    title: string;
    description: string;
    address: string;
    scheduledDate: string;
    clientPhone: string;
    city?: string;
    state?: string;
  }
) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required. Please login.");
    }

    // Backend expects: { workerId, title, description, address, scheduledDate, clientPhone }
    const payload = {
      workerId,
      title: data.title,
      description: data.description,
      address: data.address,
      scheduledDate: data.scheduledDate,
      clientPhone: data.clientPhone,
      // Sending city/state just in case backend needs them later, 
      // though your current controller doesn't explicitly save them.
      city: data.city, 
      state: data.state 
    };

    const { data: response } = await api.post("/job-requests", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (err: any) {
    console.error("Failed to send request:", err.response?.data || err.message);
    throw err; // Re-throw so the UI can show the toast error
  }
}