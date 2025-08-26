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
  // find worker entry linked to userId
  const { data: workerData } = await axios.get(`${API_URL}/workers?userId=${userId}`);
  if (!workerData.length) return null;

  const workerInfo = workerData[0];

  // get base user info
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
    requests: workerInfo.requests || [],
  };

  return profile;
}

// ---------- Mark notification as seen ----------
export async function markNotificationSeen(
  userId: string,
  notificationId: number
): Promise<Notification[]> {
  // find worker entry by userId
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
  // find worker entry by userId
  const { data: workerData } = await axios.get(`${API_URL}/workers?userId=${userId}`);
  if (!workerData.length) return [];

  const worker = workerData[0];

  // remove selected notification
  const updatedNotifications = (worker.notifications || []).filter(
    (n: Notification) => n.id !== notificationId
  );

  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    notifications: updatedNotifications,
  });

  return updatedNotifications;
}
