import axios from "axios";
import { API_URL } from "@/lib/constants";

export interface Request {
  _id: string;
  clientId: string;
  workerId: string;
  name: string;
  contact: string;
  description: string;
  status: "pending" | "ongoing" | "completed";
  date: string;
}

export interface Notification {
  _id: string;
  message: string;
  seen: boolean;
  date: string;
}

export const sendRequestToWorker = async (
  workerId: string,
  clientId: string,
  name: string,
  contact: string,
  description: string
) => {
  try {
    const requestId = Date.now().toString();
    const now = new Date().toISOString();

    const newRequest: Request = {
      _id: requestId,
      clientId,
      workerId,
      name,
      contact,
      description,
      status: "pending",
      date: now,
    };

    const newNotification: Notification = {
      _id: requestId,
      message: "You have a new job request",
      seen: false,
      date: now,
    };

    // Fetch worker
    const { data: worker } = await axios.get(`${API_URL}/workers/${workerId}`);
    const updatedWorkerRequests = [...(worker.requests ?? []), newRequest];
    const updatedNotifications = [...(worker.notifications ?? []), newNotification];

    await axios.patch(`${API_URL}/workers/${workerId}`, {
      requests: updatedWorkerRequests,
      notifications: updatedNotifications,
    });

    // Fetch client
    const { data: client } = await axios.get(`${API_URL}/users/${clientId}`);
    const clientRequest = {
      _id: requestId,
      workerId,
      workerName: worker.name,
      profession: worker.profession,
      status: newRequest.status,
      date: now,
    };
    const updatedClientRequests = [...(client.profile?.requests ?? []), clientRequest];

    await axios.patch(`${API_URL}/users/${clientId}`, {
      profile: {
        ...client.profile,
        requests: updatedClientRequests,
        activeJobs: client.profile?.activeJobs ?? [],
        completedJobs: client.profile?.completedJobs ?? [],
      },
    });

    return { newRequest, clientRequest, newNotification };
  } catch (err) {
    console.error("Failed to send request to worker:", err);
    throw err;
  }
};
