"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ---------- TYPES ----------
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

export interface Job {
  id: number;
  clientId?: string;
  name: string;
  contact?: string;
  description: string;
  status: "ongoing" | "completed";
  date?: string;
}

export interface Notification {
  id: number;
  message: string;
  date: string;
  seen: boolean;
  name?: string;
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
  activeJobs?: Job[];
  completedJobs?: Job[];
  termsAccepted?: boolean;
  name?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "client" | "worker";
  token?: string;
  profile?: Profile;
}

// ---------- AUTH STORE ----------
interface AuthState {
  user: User | null;
  isLogin: boolean;
  setUser: (user: User) => void;
  updateUserProfile: (profile: Partial<Profile>, name?: string) => void;
  setIsLogin: (value: boolean) => void;
  logout: () => void;

  // Shared Jobs State
  activeJobs: Job[];
  completedJobs: Job[];
  setActiveJobs: (jobs: Job[]) => void;
  setCompletedJobs: (jobs: Job[]) => void;
  markJobCompletedLocally: (jobId: number) => void;
  addActiveJob: (job: Job) => void; // ✅ add instant active job
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLogin: false,

      activeJobs: [],
      completedJobs: [],

      setActiveJobs: (jobs) => set({ activeJobs: jobs }),
      setCompletedJobs: (jobs) => set({ completedJobs: jobs }),

      // Optimistic UI update: move a job from active → completed
      markJobCompletedLocally: (jobId: number) => {
        const job = get().activeJobs.find((j) => j.id === jobId);
        if (!job) return;
        set({
          activeJobs: get().activeJobs.filter((j) => j.id !== jobId),
          completedJobs: [...get().completedJobs, { ...job, status: "completed" }],
        });
      },

      // Optimistic UI update: add a new active job
      addActiveJob: (job: Job) => {
        set({ activeJobs: [...get().activeJobs, job] });
      },

      setUser: (user) => set({ user, isLogin: true }),

      updateUserProfile: (profile, name) => {
        const currentUser = get().user;
        if (currentUser) {
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
        }
      },

      setIsLogin: (value) => set({ isLogin: value }),

      logout: () => set({ user: null, isLogin: false, activeJobs: [], completedJobs: [] }),
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
        activeJobs: state.activeJobs,
        completedJobs: state.completedJobs,
      }),
    }
  )
);

// ---------- NOTIFICATION STORE ----------
interface NotificationState {
  count: number;
  setCount: (c: number) => void;
  resetCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 0,
  setCount: (c) => set({ count: c }),
  resetCount: () => set({ count: 0 }),
}));
