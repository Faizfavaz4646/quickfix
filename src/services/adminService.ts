import axios from "axios";
import { User, Profile } from "@/types/user";

const API_URL = "http://localhost:50001";

// ✅ Fetch all users (workers + clients + admins)
export const fetchAllUsers = async (): Promise<User[]> => {
  const { data } = await axios.get<User[]>(`${API_URL}/users`);
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
  const { data: workers } = await axios.get<Profile[]>(`${API_URL}/workers`);
  let activeJobs: any[] = [];
  workers.forEach((worker) => {
    if (Array.isArray(worker.activeJobs)) {
      activeJobs = [...activeJobs, ...worker.activeJobs];
    }
  });
  return activeJobs;
};

// ✅ Fetch completed jobs from all workers
export const fetchCompletedJobs = async (): Promise<any[]> => {
  const { data: workers } = await axios.get<Profile[]>(`${API_URL}/workers`);
  let completedJobs: any[] = [];
  workers.forEach((worker) => {
    if (Array.isArray(worker.completedJobs)) {
      completedJobs = [...completedJobs, ...worker.completedJobs];
    }
  });
  return completedJobs;
};

// ✅ Fetch worker average ratings individually
export const fetchWorkerRatings = async (): Promise<{ name: string; avgRating: number }[]> => {
  const { data: workers } = await axios.get<Profile[]>(`${API_URL}/workers`);

  return workers.map((w) => {
    const avgRating =
      w.avgRating ??
      (Array.isArray(w.ratings) && w.ratings.length > 0
        ? w.ratings.reduce((a, b) => a + b, 0) / w.ratings.length
        : 0);

    return {
      name: w.name || "Unknown", // <-- fallback for undefined
      avgRating: Number(avgRating.toFixed(1)),
    };
  });
};


// ✅ Fetch overall client satisfaction (average of all ratings)
export const fetchClientSatisfaction = async (): Promise<number | null> => {
  const { data: workers } = await axios.get<Profile[]>(`${API_URL}/workers`);
  let ratings: number[] = [];

  workers.forEach((worker) => {
    if (Array.isArray(worker.ratings) && worker.ratings.length > 0) {
      ratings = [...ratings, ...worker.ratings];
    }
  });

  if (ratings.length === 0) return null;

  const avg = ratings.reduce((acc, r) => acc + r, 0) / ratings.length;
  return Number(avg.toFixed(1));
};

// ✅ Toggle block/unblock user
export const toggleUserStatus = async (user: User): Promise<User> => {
  if (!user?.id) throw new Error("Invalid user");
  const newStatus = user.status === "blocked" ? "active" : "blocked";
  const { data } = await axios.patch<User>(`${API_URL}/users/${user.id}`, { status: newStatus });
  return data;
};

// ✅ Fetch users distribution (for pie chart)
export const fetchUsersDistribution = async (): Promise<{ workers: number; clients: number }> => {
  const [workers, clients] = await Promise.all([fetchAllWorkers(), fetchAllClients()]);
  return { workers: workers.length, clients: clients.length };
};

// ✅ Fetch dashboard summary (all counts + jobs)
export const fetchDashboardSummary = async () => {
  const [users, activeJobs, completedJobs, ratings] = await Promise.all([
    fetchAllUsers(),
    fetchActiveJobs(),
    fetchCompletedJobs(),
    fetchWorkerRatings(),
  ]);

  const totalUsers = users.length;

  return {
    totalUsers,
    activeJobsCount: activeJobs.length,
    completedJobsCount: completedJobs.length,
    avgRatings: ratings,
  };
};
