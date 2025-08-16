// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Profile {
  profilePic?: string;
  state?: string;
  district?: string;
  city?: string;
  schedule?: string; // Worker-specific
  phone?: string;
  gender?:string;
  zip?:string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'worker';
  token?: string;
  profile?: Profile; // Works for both
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
              profile: { ...currentUser.profile, ...profile },
            },
          });
        }
      },

      setIsLogin: (value) => set({ isLogin: value }),

      logout: () => set({ user: null, isLogin: false }),
    }),
    {
      name: 'quickfix-user',
    }
  )
);
