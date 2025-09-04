import axios from "axios";

const API_URL = "http://localhost:50001";

export const sendRequestToWorker = async (
  workerId: string,   // worker.id in DB (not userId)
  clientId: string,   // user.id in DB
  name: string,
  contact: string,
  description: string
) => {
  const newRequest = {
    id: Date.now(),
    clientId,
    workerId,
    name,
    contact,
    description,
    status: "pending",
    date: new Date().toISOString(),
  };

  const newNotification = {
    id: Date.now(),
    message: "You have a new job request",
    seen: false,
    date: new Date().toISOString(),
  };

  // ---------- 1. Fetch worker ----------
  const { data: worker } = await axios.get(`${API_URL}/workers/${workerId}`);

  // ---------- 2. Fetch client ----------
  const { data: client } = await axios.get(`${API_URL}/users/${clientId}`);

  // ---------- 3. Append request for worker ----------
  const updatedWorkerRequests = [...(worker.requests || []), newRequest];
  const updatedNotifications = [...(worker.notifications || []), newNotification];

  await axios.patch(`${API_URL}/workers/${workerId}`, {
    requests: updatedWorkerRequests,
    notifications: updatedNotifications,
  });

  // ---------- 4. Save simplified request for client ----------
  const clientRequest = {
    id: newRequest.id,
    workerId,
    workerName: worker.name,
    profession: worker.profession,
    status: newRequest.status,
    date: newRequest.date,
  };

  const updatedClientRequests = [
    ...(client.profile?.requests || []),
    clientRequest,
  ];

  await axios.patch(`${API_URL}/users/${clientId}`, {
    profile: {
      ...client.profile,
      requests: updatedClientRequests,
      activeJobs: client.profile?.activeJobs || [],
      completedJobs: client.profile?.completedJobs || [],
    },
  });

  return { newRequest, clientRequest, newNotification };
};
