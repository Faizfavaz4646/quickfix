// src/store/authStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Profile, Job, Notification } from "@/types/user";
import axios from "axios";
import { API_URL } from "@/lib/constants";

// ---------- AUTH STORE ----------
interface AuthState {
  user: User | null;
  isLogin: boolean;
  setUser: (user: User) => void;
  updateUserProfile: (profile: Partial<Profile>, name?: string) => void;
  setIsLogin: (value: boolean) => void;
  logout: () => void;

  // Jobs State
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

      setUser: (user) => {
        // Mark user online if not blocked
        const status = user.status === "blocked" ? "blocked" : "online";
        set({ user: { ...user, status }, isLogin: true });
      },

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

      logout: () => {
        const currentUser = get().user;
        if (currentUser && currentUser.status !== "blocked") {
          // Update backend status to offline
          axios
            .patch(`${API_URL}/users/${currentUser.id}`, { status: "offline" })
            .catch(console.error);
        }

        set({
          user: currentUser
            ? { ...currentUser, status: currentUser.status === "blocked" ? "blocked" : "offline" }
            : null,
          isLogin: false,
          activeJobs: [],
          completedJobs: [],
        });
      },
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
              status: state.user.status, // persist status
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
  notifications: Notification[];
  count: number;
  setNotifications: (notifs: Notification[]) => void;
  addNotification: (notif: Notification) => void;
  resetCount: () => void;
  incrementCount: () => void;
  setCount: (value: number) => void;   // ✅ add this
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  count: 0,

  setNotifications: (notifs) => set({ notifications: notifs }),
  addNotification: (notif) =>
    set({
      notifications: [...get().notifications, notif],
      count: get().count + 1,
    }),
  resetCount: () => set({ count: 0 }),
  incrementCount: () => set({ count: get().count + 1 }),
  setCount: (value) => set({ count: value }),   // ✅ implement
}));
  