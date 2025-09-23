"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ---------- TYPES ----------

export interface Review {
  id: number;
  clientId: string | number;
  clientName: string;
  jobId: number;
  review: string;
  rating: number;
  date: string;
}

export interface RatingInput {
  clientId: string | number;
  workerId: string | number;
  jobId: number;
  rating: number;
  review: string;
  clientName: string;
}

export interface Request {
  id: number;
  clientId: string;
  workerId: string;
  name: string;
  contact: string;
  description: string;
  status: string;
  date: string;
}

export interface Comment {
  id: number | string;
  userId: string;
  userName: string;
  text: string;
  date: string;
  clientName: string;
  userProfile?: User;
  profilePic?:string;
}



export interface Job {
  id: number;
  clientId: string;
  clientName?: string;
  workerId: string;   // required
  workerName?: string;
  profession?: string;
  description?: string;
  status: "pending" | "ongoing" | "completed";
  date: string;       //  required
  reviewed?: boolean;
  name?:string;
  contact?:string;
  location?:string;
  images?: string[];
  likes?:string[];      // ✅number of likes
  comments?: Comment[];
}

export interface Field<T> {
  name: keyof T; // ensures only keys from T are valid
  label: string;
  type: "text" | "number" | "select";
  options?: { label: string; value: string }[];
  placeholder?: string;
  maxLength?: number;
}

export interface Notification {
  id: number;
  message: string;
  date: string;
  seen: boolean;
  name?: string;       // optional, if merged with request
  contact?: string;
  description?: string;
}

export interface Profile {
  id?: number;
  profilePic?: string;
  state?: string;
  district?: string;
  city?: string;
  schedule?: string;
  phone?: string;
  gender?: string;
  zip?: string;
  profession?: string;
  previousWorkImages?: string[];
  notifications?: Notification[];
  requests?: Request[];
  termsAccepted?: boolean;
  name?: string;
  reviews?: Review[];      // ← Add this for workers
  ratings?: number[];      // ← Add this for workers
  avgRating?: number;      // ← Optional average rating
   activeJobs?: Job[];
  completedJobs?: Job[];

  
 
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "client" | "worker";
  token?: string;
  profile?: Profile;
  profession?: string;
  status?: "active" | "online" | "offline" | "blocked";
  location?: string; // ← Add this
  profilePic?:string;
  state?:string;
  district?:string;
  city?:string;
 

}


// ---------- AUTH STORE ----------
interface AuthState {
  user: User | null;
  isLogin: boolean;
  setUser: (user: User) => void;
  updateUserProfile: (profile: Partial<Profile>, name?: string) => void;
  setIsLogin: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLogin: false,

      setUser: (user) => set({ user, isLogin: true }),

      updateUserProfile: (profile, name) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              name: name ?? currentUser.name, // update root-level name too
              profile: {
                ...currentUser.profile,
                ...profile,
              },
            },
          });
        }
      },

      setIsLogin: (value) => set({ isLogin: value }),

      logout: () => set({ user: null, isLogin: false }),
    }),
    {
      name: "quickfix-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              name: state.user.name,
              email: state.user.email,
              role: state.user.role,
              token: state.user.token,
              profile: state.user.profile,
            }
          : null,
        isLogin: state.isLogin,
      }),
    }
  )
);
