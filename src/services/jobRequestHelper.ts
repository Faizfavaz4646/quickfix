import axios from "axios";

export const sendRequestToWorker = async (
  workerId: number,
  clientId: number,
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

  // 1. Fetch worker
  const { data: worker } = await axios.get(
    `http://localhost:50001/workers/${workerId}`
  );

  // 2. Append request & notification
  const updatedRequests = [...(worker.requests || []), newRequest];
  const updatedNotifications = [
    ...(worker.notifications || []),
    newNotification,
  ];

  // 3. Patch worker
  await axios.patch(`http://localhost:50001/workers/${workerId}`, {
    requests: updatedRequests,
    notifications: updatedNotifications,
  });

  return { newRequest, newNotification };
};
