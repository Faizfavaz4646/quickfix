// src/services/clientService.ts

import axios from "axios";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({ baseURL: API_URL });

// --- Helper: Robust Token Finder (Updated for your nesting) ---
const getAuthToken = () => {
  // 1. Try Zustand Memory (Fastest)
  const state = useAuthStore.getState() as any;
  if (state.token) return state.token;
  if (state.user?.token) return state.user.token; // Check inside user object

  // 2. Try LocalStorage for "quickfix-user"
  if (typeof window !== "undefined") {
    const quickFixData = localStorage.getItem("quickfix-user");
    if (quickFixData) {
      try {
        const parsed = JSON.parse(quickFixData);
        
        // ✅ CORRECT PATH: Check state.user.token (matches your screenshot)
        if (parsed.state?.user?.token) {
          return parsed.state.user.token;
        }

        // Fallback: Check state.token (older structure)
        if (parsed.state?.token) {
          return parsed.state.token;
        }
      } catch (e) {
        console.warn("Failed to parse quickfix-user JSON", e);
      }
    }

    // 3. Fallbacks for other common keys
    const rawToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (rawToken) return rawToken;

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

/* =====================================================
   CLIENT PROFILE APIs
   ===================================================== */
export async function getClientProfile(token: string) {
  try {
    const { data } = await api.get("/client/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { profile: data }; 
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