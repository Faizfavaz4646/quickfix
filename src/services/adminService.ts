import axios from "axios";
import { User } from "@/types/user";

const API_URL = "http://localhost:50001";

// ✅ Fetch all users (workers + clients + admins)
export const fetchAllUsers = async (): Promise<User[]> => {
  const { data } = await axios.get<User[]>(`${API_URL}/users`);
  // Ensure status is always defined
  return data.map((u) => ({ ...u, status: u.status ?? "active" }));
};

// ✅ Fetch all workers
export const fetchAllWorkers = async (): Promise<User[]> => {
  const { data } = await axios.get<User[]>(`${API_URL}/users?role=worker`);
  return data.map((u) => ({ ...u, status: u.status ?? "active" }));
};

// ✅ Fetch all clients
export const fetchAllClients = async (): Promise<User[]> => {
  const { data } = await axios.get<User[]>(`${API_URL}/users?role=client`);
  return data.map((u) => ({ ...u, status: u.status ?? "active" }));
};

// ✅ Fetch active jobs from all workers
export const fetchActiveJobs = async (): Promise<any[]> => {
  const { data: workers } = await axios.get<User[]>(`${API_URL}/users?role=worker`);
  let activeJobs: any[] = [];

  workers.forEach((worker) => {
    if (worker.profile && Array.isArray(worker.profile.activeJobs)) {
      activeJobs = [...activeJobs, ...worker.profile.activeJobs];
    }
  });

  return activeJobs;
};

// ✅ Fetch average client satisfaction (from workers' ratings)
export const fetchClientSatisfaction = async (): Promise<number | null> => {
  const { data: workers } = await axios.get<User[]>(`${API_URL}/users?role=worker`);
  let ratings: number[] = [];

  workers.forEach((worker) => {
    if (worker.profile && Array.isArray(worker.profile.ratings)) {
      ratings = [...ratings, ...worker.profile.ratings];
    }
  });

  if (ratings.length === 0) return null;
  const avg = ratings.reduce((acc, r) => acc + r, 0) / ratings.length;
  return Number(avg.toFixed(1));
};

// ✅ Toggle block/unblock any user
export const toggleUserStatus = async (user: User): Promise<User> => {
  if (!user?.id) throw new Error("Invalid user");

  const newStatus = user.status === "blocked" ? "active" : "blocked";

  const { data } = await axios.patch<User>(`${API_URL}/users/${user.id}`, {
    status: newStatus,
  });

  return data; // return updated user
};
