import axios from "axios";

const API_URL = "http://localhost:50001";

export async function getWorkerProfile(userId: string) {
  const { data: workerData } = await axios.get(`${API_URL}/workers?userId=${userId}`);
  if (!workerData.length) return null;

  const workerInfo = workerData[0];
  const { data: userData } = await axios.get(`${API_URL}/users/${workerInfo.userId}`);

  return {
    ...workerInfo,
    name: userData.name,
    email: userData.email,
    profilePic:workerInfo.profilePic,
    previousWorkImages: workerInfo.previousWorkImages || [],
  };
}
