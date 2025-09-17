import axios from "axios";

const API_URL = "http://localhost:50001";

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: "active" | "blocked";
  profile?: {
    profilePic?: string;
  };
}

// ✅ Fetch all users (workers + clients + admins)
export const fetchAllUsers = async () => {
  const { data } = await axios.get(`${API_URL}/users`);
  return data;
};

// ✅ Fetch all workers
export const fetchAllWorkers = async (): Promise<Worker[]> => {
  const { data } = await axios.get<Worker[]>(`${API_URL}/users?role=worker`);
  return data;
};

// ✅ Fetch all clients
export const fetchAllClients = async () => {
  const { data } = await axios.get(`${API_URL}/users?role=client`);
  return data;
};


// Fetch Active Jobs (from each worker's activeJobs array)
export const fetchActiveJobs = async (): Promise<any[]> => {
  const { data: workers } = await axios.get(`${API_URL}/workers`);

  let activeJobs: any[] = [];

  workers.forEach((worker: any) => {
    if (Array.isArray(worker.activeJobs)) {
      activeJobs = [...activeJobs, ...worker.activeJobs];
    }
  });

  return activeJobs;
};


// ✅ Fetch average client satisfaction (from workers' ratings)
export const fetchClientSatisfaction = async (): Promise<number | null> => {
  const { data: workers } = await axios.get(`${API_URL}/workers`);
  let ratings: number[] = [];

  workers.forEach((worker: any) => {
    if (Array.isArray(worker.ratings)) {
      ratings = [...ratings, ...worker.ratings];
    }
  });

  if (ratings.length === 0) return null;

  const avg = ratings.reduce((acc, r) => acc + r, 0) / ratings.length;
  return Number(avg.toFixed(1));
};



// ✅ Toggle block/unblock a worker
export const toggleWorkerStatus = async (worker: Worker): Promise<void> => {
  await axios.patch(`${API_URL}/users/${worker.id}`, {
    status: worker.status === "blocked" ? "active" : "blocked",
  });
};
