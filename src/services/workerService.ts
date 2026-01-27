import axios from "axios";
import { API_URL } from "@/lib/constants";
import { Profile, Notification, User } from "@/types/user";

const api = axios.create({ baseURL: API_URL });

/* =====================================================
   PUBLIC APIs (CLIENT SIDE)
   ===================================================== */




/**
 * Search workers (client only)
 */
export async function searchWorkers(
  profession: string,
  location: string
) {
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

/**
/**
 * PUBLIC – Get worker profile by workerId (client view)
 */
export async function getWorkerProfile(
  workerId: string
): Promise<Profile | null> {
  try {
    if (!workerId) return null;

    const { data } = await api.get(`/worker/${workerId}`);

    if (!data) return null;

    return {
      ...data,
      userId: typeof data.userId === "object" ? data.userId._id : data.userId,
      name: data.userId?.name ?? "",
      email: data.userId?.email ?? "",
    };
  } catch (err) {
    console.error("Public worker profile fetch failed:", err);
    return null;
  }
}



/* =====================================================
   PRIVATE APIs (WORKER SIDE – AUTH REQUIRED)
   ===================================================== */

/**
 * INTERNAL helper – get worker by logged-in USER ID
 * (used only for worker dashboard actions)
 */
async function getWorkerByUserId(userId: string | number) {
  const { data } = await api.get(`/worker/by-user/${userId}`);
  return data ?? null;
}

/**
 * INTERNAL helper – get user
 */
export async function getUserById(userId: string | number): Promise<User | null> {
  const { data } = await api.get(`/users/${userId}`);
  return data ?? null;
}

/* =====================================================
   RATING & REVIEW (CLIENT → WORKER)
   ===================================================== */

export async function submitRatingAndReview(
  clientId: string | number,
  workerUserId: string | number,
  jobId: string,
  rating: number,
  review: string,
  clientNameFallback: string
) {
  try {
    const worker = await getWorkerByUserId(workerUserId);
    if (!worker) throw new Error("Worker not found");

    const client = await getUserById(clientId);
    if (!client) throw new Error("Client not found");

    const newReview = {
      _id: Date.now().toString(),
      jobId,
      rating,
      review,
      clientId,
      clientName: client.name || clientNameFallback,
      date: new Date().toISOString(),
    };

    const reviews = [...(worker.reviews ?? []), newReview];
    const ratings = [...(worker.ratings ?? []), rating];
    const avgRating =
      ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;

    await api.patch(`/worker/${worker._id}`, {
      reviews,
      ratings,
      avgRating,
    });

    return { success: true };
  } catch (err) {
    console.error("Rating failed:", err);
    return { success: false, error: err };
  }
}

/* =====================================================
   NOTIFICATIONS (WORKER SIDE)
   ===================================================== */

export async function markNotificationSeen(
  userId: string,
  notificationId: string
): Promise<Notification[]> {
  const worker = await getWorkerByUserId(userId);
  if (!worker) return [];

  const notifications = (worker.notifications ?? []).map((n: Notification) =>
    n._id === notificationId ? { ...n, seen: true } : n
  );

  await api.patch(`/worker/${worker._id}`, { notifications });
  return notifications;
}

export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<Notification[]> {
  const worker = await getWorkerByUserId(userId);
  if (!worker) return [];

  const notifications = (worker.notifications ?? []).filter(
    (n: Notification) => n._id !== notificationId
  );

  await api.patch(`/worker/${worker._id}`, { notifications });
  return notifications;
}

/* =====================================================
   REQUESTS (WORKER SIDE)
   ===================================================== */

export async function declineRequest(userId: string, requestId: string) {
  const worker = await getWorkerByUserId(userId);
  if (!worker) return null;

  const requests = (worker.requests ?? []).filter(
    (r: any) => r._id !== requestId
  );

  await api.patch(`/worker/${worker._id}`, { requests });
  return worker;
}

export async function acceptRequest(userId: string, requestId: string) {
  const worker = await getWorkerByUserId(userId);
  if (!worker) return null;

  const request = (worker.requests ?? []).find(
    (r: any) => r._id === requestId
  );
  if (!request) return worker;

  const updatedRequests = worker.requests.filter(
    (r: any) => r._id !== requestId
  );

  const updatedActiveJobs = [
    ...(worker.activeJobs ?? []),
    { ...request, status: "ongoing" },
  ];

  await api.patch(`/worker/${worker._id}`, {
    requests: updatedRequests,
    activeJobs: updatedActiveJobs,
  });

  return worker;
}


const getCleanPayload = (form: Profile) => {
  const { 
    name, profession, phone, gender, state, 
    district, city, zip, schedule, profilePic, 
    previousWorkImages 
  } = form;

  return {
    name, profession, phone, gender, state, 
    district, city, zip, schedule, profilePic, 
    previousWorkImages 
  };
};

export async function getMyWorkerProfile(token: string): Promise<Profile | null> {
  try {
    const { data } = await api.get("/worker/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

// Creation - POST
export async function updateMyWorkerProfile(form: Profile, token: string) {
  const payload = getCleanPayload(form);
  return api.post("/worker/upsert", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Edit/Update - PATCH
export async function editMyWorkerProfile(form: Profile, token: string) {
  const payload = getCleanPayload(form);
  return api.patch("/worker/upsert", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export const getWorkerRating = async (workerId: string): Promise<number> => {
  try {
    // Calling your existing endpoint: GET /worker?userId=...
    // Note: API_URL should technically be http://localhost:5001/api, but based on your app.js it might just be localhost:5001
    // We manually construct the path to match your working '/worker' route
    const { data } = await axios.get(`http://localhost:5001/worker`, {
      params: { userId: workerId }
    });

    // Handle array vs object response
    const workerData = Array.isArray(data) ? data[0] : data;

    if (workerData && typeof workerData.averageRating === 'number') {
      return workerData.averageRating;
    }
    
    return 0; // Default to 0 if not found
  } catch (error: any) {
    // Log error but return 0 so UI doesn't break
    console.error("Error fetching rating:", error.message);
    return 0; 
  }
}

export async function getTopRatedWorkers() {
  try {
    const { data } = await api.get("/worker/top", {
      params: { limit: 3, sort: "-rating" }
    });
    // Backend returns { success: true, data: [...] }
    return data.data || [];
  } catch (err) {
    console.error("Error fetching top workers:", err);
    return [];
  }
}
