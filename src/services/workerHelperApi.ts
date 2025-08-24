// utils/workerApi.ts
import axios from "axios";
import { Profile } from "@/types/user";

const BASE_URL = "http://localhost:50001/workers";

export const createWorker = async (form: Profile, userId: number) => {
  return axios.post(BASE_URL, { ...form, userId });
};

export const updateWorker = async (form: Profile, workerId: number, userId: number) => {
  return axios.patch(`${BASE_URL}/${workerId}`, { ...form, userId });
};
