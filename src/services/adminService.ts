import axios from "axios";
import { User } from "@/types/user";

// ✅ REMOVED /api - Matches your backend: app.use("/admin", adminRoutes)
const API_URL = "http://localhost:5001/admin"; 

// ✅ Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ✅ Automatically add JWT Token from localStorage
api.interceptors.request.use((config) => {
  // 1. Get the raw string from localStorage
  const authData = localStorage.getItem("quickfix-user");

  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      
      /** * ✅ MATCHING YOUR STORE: 
       * Your partialize saves: { user, token, isLogin }
       * So the token is located at: parsed.state.token
       */
      const token = parsed.state?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // This is what triggers your "Critical" console error
        console.error("Critical: No token found in persisted state!");
      }
    } catch (e) {
      console.error("Critical: Failed to parse auth storage JSON");
    }
  } else {
    console.error("Critical: No 'quickfix-user' entry found in LocalStorage!");
  }

  return config;
});

/* ================= USERS MANAGEMENT ================= */

/* ================= USERS MANAGEMENT ================= */

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const { data } = await api.get<User[]>("/users");
    return data.map((u) => ({ 
      ...u, 
      id: u._id, 
      status: u.status || "active" 
    }));
  } catch (error: any) {
    console.error("Fetch Users Error:", error.response?.status, error.message);
    throw error;
  }
};

// ✅ ADD THIS: Fetch and filter for Workers
export const fetchAllWorkers = async (): Promise<User[]> => {
  const users = await fetchAllUsers();
  return users.filter((u) => u.role === "worker");
};

// ✅ ADD THIS: Fetch and filter for Clients
export const fetchAllClients = async (): Promise<User[]> => {
  const users = await fetchAllUsers();
  return users.filter((u) => u.role === "client");
};

/* ================= ACTIONS ================= */

export const toggleUserStatus = async (user: User): Promise<User> => {
  const targetId = user._id || (user as any).id;
  if (!targetId) throw new Error("User ID is required");

  // This hits: http://localhost:5001/admin/users/[ID]/block
  const { data } = await api.patch(`/users/${targetId}/block`);
  
  return {
    ...user,
    status: user.status === "active" ? "blocked" : "active"
  };
};

/* ================= STATS ================= */

export const fetchDashboardStats = async () => {
  const { data } = await api.get("/stats");
  return data;
};

/* ================= ANALYTICS ================= */

// ✅ Added missing export
export const fetchClientSatisfaction = async (): Promise<number> => {
  try {
    const users = await fetchAllUsers();
    
    // Filter for workers who have an averageRating
    const workers = users.filter(u => u.role === 'worker');
    
    const ratings = workers
      .map(w => w.averageRating || 0)
      .filter(rating => rating > 0);

    if (ratings.length === 0) return 4.5; // Default fallback for UI

    const total = ratings.reduce((acc, curr) => acc + curr, 0);
    const avg = total / ratings.length;
    
    return Number(avg.toFixed(1));
  } catch (error) {
    console.error("Error calculating satisfaction:", error);
    return 0;
  }
};

// ✅ Optional: Analytics for User Distribution
export const fetchUsersDistribution = async () => {
  const users = await fetchAllUsers();
  const workers = users.filter(u => u.role === 'worker').length;
  const clients = users.filter(u => u.role === 'client').length;
  return { workers, clients };
};