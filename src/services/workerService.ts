import axios from "axios";
import { Profile, Notification, User } from "@/store/authStore";

const API_URL = "http://localhost:50001";

// ---------- Fetch all workers ----------
export async function fetchAllWorkers(): Promise<Profile[]> {
  const { data } = await axios.get(`${API_URL}/workers`);
  return data;
}

// ---------- Get worker profile (merge user + worker info) ----------
export async function getWorkerProfile(userId: string): Promise<Profile | null> {
  const { data: workerData } = await axios.get(`${API_URL}/workers?userId=${userId}`);
  if (!workerData.length) return null;

  const workerInfo = workerData[0];

  const { data: userData }: { data: User } = await axios.get(
    `${API_URL}/users/${workerInfo.userId}`
  );

  const profile: Profile = {
    ...workerInfo,
    name: userData.name,
    email: userData.email,
    profilePic: workerInfo.profilePic,
    previousWorkImages: workerInfo.previousWorkImages || [],
    notifications: workerInfo.notifications || [],
    Requests: workerInfo.requests || [],
    activeJobs: workerInfo.activeJobs || [],
    completedJobs: workerInfo.completedJobs || [], // 👈 ensure completed jobs exist
  };

  return profile;
}

// ---------- Mark notification as seen ----------
export async function markNotificationSeen(
  userId: string,
  notificationId: number
): Promise<Notification[]> {
  const { data: workerData } = await axios.get(`${API_URL}/workers?userId=${userId}`);
  if (!workerData.length) return [];

  const worker = workerData[0];

  const updatedNotifications = (worker.notifications || []).map((n: Notification) =>
    n.id === notificationId ? { ...n, seen: true } : n
  );

  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    notifications: updatedNotifications,
  });

  return updatedNotifications;
}

// ---------- Delete notification ----------
export async function deleteNotification(
  userId: string,
  notificationId: number
): Promise<Notification[]> {
  const { data: workerData } = await axios.get(`${API_URL}/workers?userId=${userId}`);
  if (!workerData.length) return [];

  const worker = workerData[0];

  const updatedNotifications = (worker.notifications || []).filter(
    (n: Notification) => n.id !== notificationId
  );

  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    notifications: updatedNotifications,
  });

  return updatedNotifications;
}

// ---------- Decline request ----------
export async function declineRequest(userId: string, requestId: number) {
  const { data: workerData } = await axios.get(`${API_URL}/workers?userId=${userId}`);
  if (!workerData.length) return null;

  const worker = workerData[0];

  const updatedRequests = (worker.requests || []).filter((r: any) => r.id !== requestId);

  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    requests: updatedRequests,
  });

  return await getWorkerProfile(userId);
}

// ---------- Accept request ----------
export async function acceptRequest(userId: string, requestId: number) {
  const { data: workerData } = await axios.get(`${API_URL}/workers?userId=${userId}`);
  if (!workerData.length) return null;

  const worker = workerData[0];
  const request = (worker.requests || []).find((r: any) => r.id === requestId);
  if (!request) return await getWorkerProfile(userId);

  const updatedRequests = (worker.requests || []).filter((r: any) => r.id !== requestId);

  const updatedActiveJobs = [ ...(worker.activeJobs || []), { ...request, status: "ongoing" },
  ];

  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    requests: updatedRequests,
    activeJobs: updatedActiveJobs,
  });

  return await getWorkerProfile(userId);
}

// ---------- Mark job as completed ----------
export async function markJobCompleted(userId: string, jobId: number) {
  const { data: workerData } = await axios.get(`${API_URL}/workers?userId=${userId}`);
  if (!workerData.length) return null;

  const worker = workerData[0];

  // Find the job in activeJobs
  const jobToComplete = (worker.activeJobs || []).find((job: any) => job.id === jobId);
  if (!jobToComplete) return null;

  // Remove from activeJobs
  const updatedActiveJobs = (worker.activeJobs || []).filter((job: any) => job.id !== jobId);

  // Add to completedJobs (initialize if doesn't exist)
  const updatedCompletedJobs = [...(worker.completedJobs || []), { ...jobToComplete, status: "completed" }];

  // Patch the worker
  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    activeJobs: updatedActiveJobs,
    completedJobs: updatedCompletedJobs,
  });

  // Return updated profile
  return await getWorkerProfile(userId);
}
