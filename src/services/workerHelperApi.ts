// utils/workerApi.ts
import axios from "axios";
import { Profile } from "@/types/user";
import { API_URL } from "@/lib/constants";


export const createWorker = async (form: Profile, userId: number) => {
  return axios.post(`${API_URL}/worker`, { ...form, userId });
};

export const updateWorker = async (form: Profile, workerId: string, token: string) => {
  return axios.patch(`${API_URL}/worker/${workerId}`, form, {
    headers: {
      Authorization: `Bearer ${token}`, // <-- send token
    },
  });
};

