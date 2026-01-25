import axios from "axios";
import { API_URL } from "@/lib/constants"; 
import { JobRequest } from "@/types/request";
import { toast } from "sonner";

// ✅ MAIN FUNCTION: Fetches ALL requests (Pending + History)
// This fixes the empty history tab issue.
export const getWorkerRequests = async (token: string): Promise<JobRequest[]> => {
  try {
    // We use the '/all' endpoint so we get everything
    const { data } = await axios.get(`${API_URL}/job-requests/worker/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Fetch requests error:", error);
    return [];
  }
};

// --- GET ACTIVE JOBS (For Dashboard) ---
export const getWorkerActiveJobs = async (token: string): Promise<JobRequest[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/job-requests/worker/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Fetch active jobs error:", error);
    return [];
  }
};

// --- GET COMPLETED JOBS (For Dashboard) ---
export const getWorkerCompletedJobs = async (token: string): Promise<JobRequest[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/job-requests/worker/completed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Fetch completed jobs error:", error);
    return [];
  }
};

// --- UPDATE STATUS ---
export const updateRequestStatus = async (
  requestId: string, 
  status: "accepted" | "rejected" | "completed",
  token: string
): Promise<boolean> => {
  try {
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
//  GET CLIENT REQUESTS (Client View)

export const getClientRequests = async (token: string, status?: string): Promise<JobRequest[]> => {
  try {
    // Allows filtering: getClientRequests(token, 'pending')
    const url = status 
      ? `${API_URL}/job-requests/client/all?status=${status}`
      : `${API_URL}/job-requests/client/all`;

    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Fetch client requests error:", error);
    return [];
  }
};