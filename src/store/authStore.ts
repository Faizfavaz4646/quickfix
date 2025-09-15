// src/store/authStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Profile, Job } from "@/types/user";

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
  addActiveJob: (job: Job) => void;
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

      markJobCompletedLocally: (jobId: number) => {
        const job = get().activeJobs.find((j) => j.id === jobId);
        if (!job) return;
        set({
          activeJobs: get().activeJobs.filter((j) => j.id !== jobId),
          completedJobs: [...get().completedJobs, { ...job, status: "completed" }],
        });
      },

      addActiveJob: (job) => {
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

      logout: () =>
        set({
          user: null,
          isLogin: false,
          activeJobs: [],
          completedJobs: [],
        }),
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
