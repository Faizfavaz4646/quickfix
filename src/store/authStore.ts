"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Profile, Job } from "@/types/user";
import axios from "axios";
import { API_URL } from "@/lib/constants";

// ---------- AUTH STORE ----------

interface AuthState {
  // 1. DATA STATE
  user: User | null;
  token: string | null; // ✅ Added Top-Level Token
  isLogin: boolean;
  hasHydrated: boolean;

  // 2. ACTIONS
  setHasHydrated: (state: boolean) => void;
  
  // Replaces 'setUser' with a more robust 'login' action
  login: (user: User, token: string) => void; 
  
  // Updates specific parts of the user profile
  updateUserProfile: (profile: Partial<Profile>, name?: string) => void;
  
  logout: () => void;

  // 3. JOB STATE
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
      // --- Initial State ---
      user: null,
      token: null, // Start empty
      isLogin: false,
      hasHydrated: false,
      activeJobs: [],
      completedJobs: [],

      // --- Actions ---

      setHasHydrated: (state) => set({ hasHydrated: state }),

      // ✅ Real-World Login Method
    login: (user, token) => {
        // 1. Cast the status explicitly to User["status"] so TS knows it's valid
        const status = (user.status === "blocked" ? "blocked" : "online") as User["status"];
        
        const finalUser = {
          ...user,
          status,
          email: user.email || (user as any).emailId, 
        };

        set({
          // 2. Cast the final object as User to resolve any other minor mismatches
          user: finalUser as User,
          token: token, 
          isLogin: true,
        });
      },

      updateUserProfile: (profile, name) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            name: name ?? currentUser.name,
            profile: {
              ...currentUser.profile, // Keep existing profile data
              ...profile, // Overwrite with new data
            },
          },
        });
      },

      logout: () => {
        const { user, token } = get();
        
        // Optional: Notify backend of offline status
        if (user && user._id && user.status !== "blocked") {
          // Use the token for the logout request if needed by backend
          axios.patch(
            `${API_URL}/users/${user._id}`, 
            { status: "offline" },
            { headers: token ? { Authorization: `Bearer ${token}` } : {} } 
          ).catch(console.error);
        }

        // Wipe everything
        set({
          user: null,
          token: null,
          isLogin: false,
          activeJobs: [],
          completedJobs: [],
        });
      },

      // --- Job Actions ---
      setActiveJobs: (jobs) => set({ activeJobs: jobs }),
      setCompletedJobs: (jobs) => set({ completedJobs: jobs }),
      
      addActiveJob: (job) => set({ activeJobs: [...get().activeJobs, job] }),

      markJobCompletedLocally: (jobId) => {
        const currentActive = get().activeJobs;
        const jobIndex = currentActive.findIndex((j) => j.id === jobId); // Using findIndex is safer
        
        if (jobIndex === -1) return;

        const job = currentActive[jobIndex];
        const newActive = [...currentActive];
        newActive.splice(jobIndex, 1);

        set({
          activeJobs: newActive,
          completedJobs: [...get().completedJobs, { ...job, status: "completed" }],
        });
      },
    }),
    {
      name: "quickfix-user", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      
      // Handle Hydration (Page Load)
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },

      // ✅ Cleaner Persistence
      // Only save what we strictly need to restore the session
      partialize: (state) => ({
        user: state.user,
        token: state.token, // Explicitly save the token
        isLogin: state.isLogin,
        activeJobs: state.activeJobs,
        completedJobs: state.completedJobs,
      }),
    }
  )
);

// ---------- NOTIFICATION STORE (Unchanged) ----------
interface NotificationState {
  notifications: Notification[];
  count: number;
  setNotifications: (notifs: Notification[]) => void;
  addNotification: (notif: Notification) => void;
  resetCount: () => void;
  incrementCount: () => void;
  setCount: (value: number) => void;
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
  setCount: (value) => set({ count: value }),
}));