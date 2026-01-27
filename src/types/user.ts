"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ---------- TYPES ----------

export interface Review {
  _id?: string;
  clientId: string;
  clientName: string;
  jobId: string;
  review: string;
  rating: number;
  date: string;
}

export interface RatingInput {
  clientId: string;
  workerId: string;
  jobId: string;
  rating: number;
  review: string;
  clientName: string;
}

export interface Request {
  _id?: string;
  clientId: string;
  workerId: string;
  name: string;
  contact: string;
  description: string;
  status: string;
  date: string;
  clientName?: string;
}

export interface Comment {
  _id?: string;
  userId: string;
  userName?: string;
  text: string;
  date: string;
  clientName?: string;
  userProfile?: User;
  profilePic?: string;
}
export interface Job {
  _id?: string;
  clientId: string;          // just the type, no values here
  clientName: string;        // required string
  workerId: string;
  workerName?: string;
  profession?: string;
  description?: string;
  status: "pending" | "ongoing" | "completed";
  date: string;
  reviewed?: boolean;
  name?: string;
  contact?: string;
  location?: string;
  images?: string[];
  likes?: string[];
  comments?: Comment[];
  profilePic?: string;
}

export interface Notification {
  _id?: string;
  message: string;
  date: string;
  seen: boolean;
  name?: string;
  contact?: string;
  description?: string;
}



export interface Profile {
  _id?: string;
  // ✅ FIXED: Allow string (ID) OR object (Populated User)
  userId?: string | any; 
  email?: string;
  profilePic?: string;
  state?: string;
  district?: string;
  city?: string;
  schedule?: string | any; // Flexible for string or object
  phone?: string;
  gender?: string;
  address?: string;
  zip?: string;
  profession?: string;
  previousWorkImages?: string[];
  
  // Arrays
  notifications?: Notification[];
  requests?: any[]; // changed to 'any' to prevent errors if Request type isn't imported
  termsAccepted?: boolean;
  name?: string;
  reviews?: any[]; // changed to 'any' for safety
  ratings?: number[];
  avgRating?: number;
  activeJobs?: any[];
  completedJobs?: any[];
  location?: string;

  // ✅ NEW FIELDS (Fixes the errors in ProfileCompletion)
  hourlyRate?: number; 
  about?: string;
  
  // Optional: Good for UI logic
  totalReviews?: number;
  jobsDone?: number;
}


export interface User {
  _id: string; 
  name: string;
  email?: string;
  emailId?: string; // ✅ Added to match backend
  role: "client" | "worker" | "admin";
  token?: string;
  profile?: Profile;
  
  // ✅ Admin & Moderation Fields
  status: "active" | "online" | "offline" | "blocked";
  averageRating?: number; // ✅ Added for Stats
  totalReviews?: number;  // ✅ Added for Stats

  createdAt?: string; 
  updatedAt?: string;
  
  // Locations & Visuals
  profession?: string;
  location?: string;
  profilePic?: string;
  state?: string;
  district?: string;
  city?: string;
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
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            name: name ?? currentUser.name,
            profile: {
              ...currentUser.profile,
              ...profile,
            },
          },
        });
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
        _id: state.user._id,
        name: state.user.name,
        
        // FIX: Map 'emailId' (from backend) to 'email' (for frontend)
        email: state.user.email || (state.user as any).emailId,
        
        role: state.user.role,
        token: state.user.token,
        profile: state.user.profile
          ? {
              ...state.user.profile,
              _id: state.user.profile._id ?? "",
              userId: state.user.profile.userId ?? state.user._id,
            }
          : undefined,
      }
    : null,
  isLogin: state.isLogin,
}),
    }
  )
);
