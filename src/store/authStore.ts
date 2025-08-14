// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'worker';
  token?: string;
  workerProfile?: any;
}

interface AuthState {
  user: User | null;
  isLogin: boolean;
  setUser: (user: User) => void;
  updateUserProfile: (workerProfile: any) => void;
  setIsLogin: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLogin: false,
      setUser: (user) => set({ user, isLogin: true }),
      updateUserProfile: (workerProfile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, workerProfile } });
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
