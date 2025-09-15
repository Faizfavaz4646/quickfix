import axios from "axios";
import { Profile, Notification, User } from "@/types/user";

const API_URL = "http://localhost:50001";
// ---------- Submit Rating & Review ----------
export async function submitRatingAndReview(
   clientId: number | string,
  workerId: number | string,
  jobId: number,
  rating: number,
  review: string,
  clientName: string
) {
  try {
    // 1. Fetch worker by userId
    const { data: workerData } = await axios.get(
      `${API_URL}/workers?userId=${workerId}`
    );
    if (!Array.isArray(workerData) || workerData.length === 0) {
      console.warn("Worker not found:", workerId);
      return { success: false, error: "Worker not found" };
    }
    const worker = workerData[0];

    // 2. Fetch client
    const { data: client } = await axios.get(`${API_URL}/users/${clientId}`);
    if (!client) {
      console.warn("Client not found:", clientId);
      return { success: false, error: "Client not found" };
    }

    // 3. Build new review
    const newReview = {
      id: Date.now(),
      clientId,
      clientName: client.name ?? clientName, // ✅ ensure name is saved
      jobId,
      review,
      rating,
      date: new Date().toISOString(),
    };

    // 4. Update worker’s reviews & ratings
    const updatedReviews = [...(worker.reviews || []), newReview];
    const updatedRatings = [...(worker.ratings || []), rating];
    const avgRating =
      updatedRatings.reduce((sum: number, r: number) => sum + r, 0) /
      updatedRatings.length;

    await axios.patch(`${API_URL}/workers/${worker.id}`, {
      reviews: updatedReviews,
      ratings: updatedRatings,
      avgRating,
    });

    // 5. Update client’s completed jobs → mark as reviewed
    if (client.profile?.completedJobs) {
      const updatedCompletedJobs = client.profile.completedJobs.map((job: any) =>
        job.id === jobId ? { ...job, reviewed: true } : job
      );

      await axios.patch(`${API_URL}/users/${client.id}`, {
        profile: {
          ...client.profile,
          completedJobs: updatedCompletedJobs,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error submitting rating & review:", error);
    return { success: false, error };
  }
}

// ---------- Fetch all workers ----------
export async function fetchAllWorkers(): Promise<Profile[]> {
  const { data } = await axios.get(`${API_URL}/workers`);
  return data;
}

// ---------- Get client profile ----------
export async function getClientProfile(userId: string): Promise<User | null> {
  try {
    const { data } = await axios.get(`${API_URL}/users/${userId}`);
    return data || null;
  } catch (error) {
    console.error("Error fetching client profile:", error);
    return null;
  }
}

// ---------- Get worker profile ----------
export async function getWorkerProfile(userId: string): Promise<Profile | null> {
  const { data: workerData } = await axios.get(
    `${API_URL}/workers?userId=${userId}`
  );
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
    requests: workerInfo.requests || [],
    activeJobs: workerInfo.activeJobs || [],
    completedJobs: workerInfo.completedJobs || [],
    reviews: workerInfo.reviews || [],
    ratings: workerInfo.ratings || [],
    avgRating: workerInfo.avgRating || 0,
  };

  return profile;
}

// ---------- Mark notification as seen ----------
export async function markNotificationSeen(
  userId: string,
  notificationId: number
): Promise<Notification[]> {
  const { data: workerData } = await axios.get(
    `${API_URL}/workers?userId=${userId}`
  );
  if (!workerData.length) return [];

  const worker = workerData[0];

  const updatedNotifications = (worker.notifications || []).map(
    (n: Notification) =>
      n.id === notificationId ? { ...n, seen: true } : n
  );

  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    notifications: updatedNotifications,
  });

  return updatedNotifications;
}

// ---------- Delete Notifications ----------
export async function deleteNotification(
  userId: string,
  notificationId: number
): Promise<Notification[]> {
  const { data: workerData } = await axios.get(
    `${API_URL}/workers?userId=${userId}`
  );
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
  const { data: workerData } = await axios.get(
    `${API_URL}/workers?userId=${userId}`
  );
  if (!workerData.length) return null;
  const worker = workerData[0];

  const updatedRequests = (worker.requests || []).filter(
    (r: any) => r.id !== requestId
  );

  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    requests: updatedRequests,
  });

  return await getWorkerProfile(userId);
}

// ---------- Accept request ----------
export async function acceptRequest(userId: string, requestId: number) {
  const { data: workerData } = await axios.get(
    `${API_URL}/workers?userId=${userId}`
  );
  if (!workerData.length) return null;
  const worker = workerData[0];

  const request = (worker.requests || []).find((r: any) => r.id === requestId);
  if (!request) return await getWorkerProfile(userId);

  const updatedRequests = (worker.requests || []).filter(
    (r: any) => r.id !== requestId
  );
  const updatedActiveJobs = [
    ...(worker.activeJobs || []),
    { ...request, status: "ongoing" },
  ];

  // Update worker
  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    requests: updatedRequests,
    activeJobs: updatedActiveJobs,
  });

  // Update client
  const { data: client } = await axios.get(
    `${API_URL}/users/${request.clientId}`
  );
  const updatedClientRequests = (client.profile?.requests || []).filter(
    (r: any) => r.id !== requestId
  );
  const updatedClientActiveJobs = [
    ...(client.profile?.activeJobs || []),
    {
      id: request.id,
      workerId: worker.userId,
      workerName: worker.name,
      profession: worker.profession,
      status: "ongoing",
      date: request.date,
    },
  ];

  const newNotification = {
    id: Date.now(),
    message: `${worker.name} accepted your job request. Please chat or call to confirm.`,
    seen: false,
    date: new Date().toISOString(),
  };

  const updatedNotifications = [
    ...(client.profile?.notifications || []),
    newNotification,
  ];

  await axios.patch(`${API_URL}/users/${client.id}`, {
    profile: {
      ...client.profile,
      requests: updatedClientRequests,
      activeJobs: updatedClientActiveJobs,
      notifications: updatedNotifications,
    },
  });

  return await getWorkerProfile(userId);
}

// ---------- Mark job as completed ----------
export async function markJobCompleted(userId: string, jobId: number) {
  const { data: workerData } = await axios.get(
    `${API_URL}/workers?userId=${userId}`
  );
  if (!workerData.length) return null;
  const worker = workerData[0];

  const jobToComplete = (worker.activeJobs || []).find(
    (job: any) => job.id === jobId
  );
  if (!jobToComplete) return null;

  const updatedActiveJobs = (worker.activeJobs || []).filter(
    (job: any) => job.id !== jobId
  );
  const updatedCompletedJobs = [
    ...(worker.completedJobs || []),
    { ...jobToComplete, status: "completed" },
  ];

  await axios.patch(`${API_URL}/workers/${worker.id}`, {
    activeJobs: updatedActiveJobs,
    completedJobs: updatedCompletedJobs,
  });

  // Update client
  const clientId = jobToComplete.clientId;
  if (clientId) {
    const { data: client } = await axios.get(`${API_URL}/users/${clientId}`);
    if (client?.profile) {
      const updatedClientActiveJobs = (
        client.profile.activeJobs || []
      ).filter((job: any) => job.id !== jobId);

      const updatedClientCompletedJobs = [
        ...(client.profile.completedJobs || []),
        {
          id: jobId, // ✅ keep jobId
          workerId: worker.userId,
          workerName: worker.name,
          profession: worker.profession,
          status: "completed",
          date: new Date().toISOString(),
        },
      ];

      await axios.patch(`${API_URL}/users/${client.id}`, {
        profile: {
          ...client.profile,
          activeJobs: updatedClientActiveJobs,
          completedJobs: updatedClientCompletedJobs,
        },
      });
    }
  }

  return await getWorkerProfile(userId);
}
