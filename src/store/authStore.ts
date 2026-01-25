"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Profile } from "@/types/user";
import axios from "axios";
import { API_URL } from "@/lib/constants";

// ---------- AUTH STORE ----------

interface AuthState {
  // 1. DATA STATE
  user: User | null;
  token: string | null;
  isLogin: boolean;
  hasHydrated: boolean;
  
  // ✅ NEW: A simple signal to tell components to re-fetch data
  refreshTrigger: number; 

  // 2. ACTIONS
  setHasHydrated: (state: boolean) => void;
  login: (user: User, token: string) => void;
  updateUserProfile: (profile: Partial<Profile>, name?: string) => void;
  logout: () => void;
  
  // Call this when a job is finished to update the "Completed" counter instantly
  triggerRefresh: () => void; 
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      user: null,
      token: null,
      isLogin: false,
      hasHydrated: false,
      refreshTrigger: 0, 

      // --- Actions ---

      setHasHydrated: (state) => set({ hasHydrated: state }),

      triggerRefresh: () => set({ refreshTrigger: get().refreshTrigger + 1 }),

      login: (user, token) => {
        const status = (user.status === "blocked" ? "blocked" : "online") as User["status"];
        
        const finalUser = {
          ...user,
          status,
          email: user.email || (user as any).emailId, 
        };

        set({
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
              ...currentUser.profile,
              ...profile,
            },
          },
        });
      },

      logout: () => {
        const { user, token } = get();
        
        if (user && user._id && user.status !== "blocked") {
          axios.patch(
            `${API_URL}/users/${user._id}`, 
            { status: "offline" },
            { headers: token ? { Authorization: `Bearer ${token}` } : {} } 
          ).catch(console.error);
        }

        // Wipe session data
        set({
          user: null,
          token: null,
          isLogin: false,
          refreshTrigger: 0,
        });
      },
    }),
    {
      name: "quickfix-user",
      storage: createJSONStorage(() => localStorage),
      
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },

      // ✅ CLEAN PERSISTENCE: Only save Auth data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLogin: state.isLogin,
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