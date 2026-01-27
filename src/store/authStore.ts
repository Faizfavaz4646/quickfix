"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Profile, Notification } from "@/types/user"; // Ensure Notification is imported
import axios from "axios";
import { API_URL } from "@/lib/constants";

// ============================================================================
// 1. AUTH STORE
// ============================================================================

interface AuthState {
  // --- Data State ---
  user: User | null;
  token: string | null;
  isLogin: boolean;
  hasHydrated: boolean;
  
  // A simple counter signal to tell components (like dashboards) to re-fetch data
  refreshTrigger: number; 

  // --- Actions ---
  setHasHydrated: (state: boolean) => void;
  login: (user: User, token: string) => void;
  updateUserProfile: (profile: Partial<Profile>, name?: string) => void;
  logout: () => void;
  
  // Trigger this when a job finishes or status changes
  triggerRefresh: () => void; 

  // ✅ FIX: Added hydrate method to interface
  hydrate: () => Promise<void>;
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

      // ✅ FIX: Added hydrate implementation
      // This allows RoleGuard to call await hydrate() if needed, 
      // though the actual data loading happens automatically via 'persist'.
      hydrate: async () => {
        return Promise.resolve();
      },

      login: (user, token) => {
        // Normalize status
        const status = (user.status === "blocked" ? "blocked" : "online") as User["status"];
        
        // ✅ ROBUST DATA NORMALIZATION
        // 1. Handle backend inconsistency (email vs emailId)
        // 2. Ensure 'profile' object exists to prevent crashes later
        const finalUser = {
          ...user,
          status,
          email: user.email || (user as any).emailId, 
          profile: user.profile || {} 
        };

        set({
          user: finalUser as User,
          token: token, 
          isLogin: true,
        });
      },

      // ✅ IMPROVED: Safe Deep Merge for Profile Updates
      updateUserProfile: (profileData, name) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            // Only update name if a new one is provided
            name: name ?? currentUser.name,
            // Safely merge profile data (handling nulls)
            profile: {
              ...(currentUser.profile || {}), 
              ...profileData,
            },
          },
        });
      },

      logout: () => {
        const { user, token } = get();
        
        // 1. Optimistic Logout: Clear UI state immediately for speed
        set({
          user: null,
          token: null,
          isLogin: false,
          refreshTrigger: 0,
        });

        // 2. Fire API call in background (don't await it)
        if (user && user._id && user.status !== "blocked") {
          axios.patch(
            `${API_URL}/users/${user._id}`, 
            { status: "offline" },
            { headers: token ? { Authorization: `Bearer ${token}` } : {} } 
          ).catch((err) => console.warn("Logout API call failed", err));
        }
      },
    }),
    {
      name: "quickfix-user", // LocalStorage Key
      storage: createJSONStorage(() => localStorage),
      
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },

      // ✅ CLEAN PERSISTENCE: Only save essential Auth data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLogin: state.isLogin,
      }),
    }
  )
);

// ============================================================================
// 2. NOTIFICATION STORE
// ============================================================================

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