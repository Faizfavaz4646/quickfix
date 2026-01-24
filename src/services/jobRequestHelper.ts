import axios from "axios";
import { API_URL } from "@/lib/constants"; 
import { JobRequest } from "@/types/request";
import { toast } from "sonner";

// --- GET PENDING REQUESTS (Worker) ---
export const getWorkerRequests = async (token: string): Promise<JobRequest[]> => {
  try {
    // ✅ CHANGED: "/requests" -> "/job-requests"
    const { data } = await axios.get(`${API_URL}/job-requests/worker/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("Worker Requests Fetched:", data); 
    return data;
  } catch (error) {
    console.error("Fetch requests error:", error);
    return [];
  }
};

// --- UPDATE STATUS (Accept/Decline) ---
export const updateRequestStatus = async (
  requestId: string, 
  status: "accepted" | "rejected" | "completed",
  token: string
): Promise<boolean> => {
  try {
    // ✅ CHANGED: "/requests" -> "/job-requests"
    await axios.patch(
      `${API_URL}/job-requests/${requestId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return true;
  } catch (error: any) {
    console.error("Update status error:", error);
    toast.error(error.response?.data?.message || "Action failed");
    return false;
  }
};

// --- SEND REQUEST (Client) ---
export const sendRequestToWorker = async (params: {
  workerId: string;
  token: string;       // We need token to authenticate
  title: string;
  description: string;
  address: string;
  scheduledDate: string; 
  clientPhone: string; // ✅ Required by backend
  city?: string;
  state?: string;
}): Promise<boolean> => {
  try {
    console.log("📤 Sending Request Payload:", params);

    // Backend expects: { workerId, title, ... }
    // We do NOT need to send clientId because the Backend gets it from the Token
    const payload = {
      workerId: params.workerId,
      title: params.title,
      description: params.description,
      address: params.address,
      scheduledDate: params.scheduledDate,
      clientPhone: params.clientPhone, 
      city: params.city || "",
      state: params.state || ""
    };

    await axios.post(
      `${API_URL}/job-requests`, 
      payload,
      {
        headers: { Authorization: `Bearer ${params.token}` },
      }
    );
    
    return true;
  } catch (error: any) {
    console.error("Send request error:", error);
    // Rethrow or return false so the component knows it failed
    throw error; 
  }
};
export const getWorkerActiveJobs = async (token: string): Promise<JobRequest[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/job-requests/worker/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Fetch active jobs error:", error);
    return [];
  }
};