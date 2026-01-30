import axios from "axios";
import { User } from "@/types/user";
import { API_URL } from "@/lib/constants";
 // ✅ IMPORT FROM LIB

// ✅ Matches backend: app.use("/admin", adminRoutes)
const ADMIN_API_URL = `${API_URL}/admin`;

// ✅ Create Axios instance
const api = axios.create({
  baseURL: ADMIN_API_URL,
  withCredentials: true,
});

// ✅ Automatically add JWT Token from localStorage
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem("quickfix-user");

  if (authData) {
    try {
      const parsed = JSON.parse(authData);

      // token location: parsed.state.token
      const token = parsed.state?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.error("Critical: No token found in persisted state!");
      }
    } catch {
      console.error("Critical: Failed to parse auth storage JSON");
    }
  } else {
    console.error("Critical: No 'quickfix-user' entry found in LocalStorage!");
  }

  return config;
});

/* ================= USERS MANAGEMENT ================= */

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const { data } = await api.get<User[]>("/users");
    return data.map((u) => ({
      ...u,
      id: u._id,
      status: u.status || "active",
    }));
  } catch (error: any) {
    console.error("Fetch Users Error:", error.response?.status, error.message);
    throw error;
  }
};

// ✅ Workers only
export const fetchAllWorkers = async (): Promise<User[]> => {
  const users = await fetchAllUsers();
  return users.filter((u) => u.role === "worker");
};

// ✅ Clients only
export const fetchAllClients = async (): Promise<User[]> => {
  const users = await fetchAllUsers();
  return users.filter((u) => u.role === "client");
};

/* ================= ACTIONS ================= */

export const toggleUserStatus = async (user: User): Promise<User> => {
  const targetId = user._id || (user as any).id;
  if (!targetId) throw new Error("User ID is required");

  await api.patch(`/users/${targetId}/block`);

  return {
    ...user,
    status: user.status === "active" ? "blocked" : "active",
  };
};

/* ================= STATS ================= */

export const fetchDashboardStats = async () => {
  const { data } = await api.get("/stats");
  return data;
};

/* ================= ANALYTICS ================= */

export const fetchClientSatisfaction = async (): Promise<number> => {
  try {
    const users = await fetchAllUsers();
    const workers = users.filter((u) => u.role === "worker");

    const ratings = workers
      .map((w) => w.averageRating || 0)
      .filter((r) => r > 0);

    if (ratings.length === 0) return 4.5;

    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Number(avg.toFixed(1));
  } catch (error) {
    console.error("Error calculating satisfaction:", error);
    return 0;
  }
};

// ✅ User distribution
export const fetchUsersDistribution = async () => {
  const users = await fetchAllUsers();
  return {
    workers: users.filter((u) => u.role === "worker").length,
    clients: users.filter((u) => u.role === "client").length,
  };
};
