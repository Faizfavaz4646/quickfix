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
  status: "accepted" | "rejected", 
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
export const sendRequestToWorker = async (data: {
  workerId: string;
  title: string;
  description: string;
  token: string;
  address: string;
  scheduledDate: string; 
}): Promise<boolean> => {
  try {
    // ✅ CHANGED: "/requests" -> "/job-requests"
    await axios.post(
      `${API_URL}/job-requests`, 
      {
        workerId: data.workerId,
        title: data.title,
        description: data.description,
        address: data.address,
        scheduledDate: data.scheduledDate
      },
      {
        headers: { Authorization: `Bearer ${data.token}` },
      }
    );
    toast.success("Request sent successfully!");
    return true;
  } catch (error: any) {
    console.error("Send request error:", error);
    toast.error(error.response?.data?.message || "Failed to send request");
    return false;
  }
};