// store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Profile {
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
  termsAccepted?: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'worker';
  token?: string;
  profile?: Profile; // ✅ full profile in runtime, but not persisted fully
}

interface AuthState {
  user: User | null;
  isLogin: boolean;
  setUser: (user: User) => void;
  updateUserProfile: (profile: Partial<Profile>) => void;
  setIsLogin: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLogin: false,

      setUser: (user) => set({ user, isLogin: true }),

      updateUserProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
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
      name: 'quickfix-user',
      storage: createJSONStorage(() => localStorage),
      // 🚨 Only persist light fields
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              name: state.user.name,
              email: state.user.email,
              role: state.user.role,
              token: state.user.token,
              // ⚠️ exclude heavy profile fields (profilePic, previousWorkImages, etc.)
            }
          : null,
        isLogin: state.isLogin,
      }),
    }
  )
);
