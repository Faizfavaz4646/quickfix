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
    const { data: worker } = await api.get(`/worker/${workerId}`);
    
    if (!worker) return null;

    if (worker.userId && typeof worker.userId === "string") {
      try {
        let user = null;
        try {
           const res = await api.get(`/users/${worker.userId}`);
           user = res.data;
        } catch (e) {
           const res = await api.get(`/user/${worker.userId}`);
           user = res.data;
        }

        if (user) {
          worker.userId = {
            _id: worker.userId,
            name: user.name,
            email: user.email || user.emailId, 
            profilePic: user.profilePic 
          };
          worker.name = user.name;
          worker.email = user.email || user.emailId;
        }
      } catch (userErr) {
        console.warn("Could not fetch user details for worker:", userErr);
      }
    }
    return worker;
  } catch (err) {
    console.error("Failed to fetch worker profile:", err);
    return null;
  }
}

/**
 * Send a Service Request
 */
export async function sendRequestToWorker(
  workerId: string,
  clientId: string,
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
    // 1. GET TOKEN using the corrected helper
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    const payload = {
      workerId,
      title: data.title,
      description: data.description,
      address: data.address,
      scheduledDate: data.scheduledDate,
      clientPhone: data.clientPhone,
      city: data.city || "",
      state: data.state || ""
    };

    const { data: response } = await api.post("/job-requests", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    return response;
  } catch (err) {
    console.error("Failed to send job request:", err);
    throw err;
  }
}