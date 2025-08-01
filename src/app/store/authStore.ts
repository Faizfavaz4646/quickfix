// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  role: 'client' | 'worker';
  token?: string;
}

interface AuthState {
  user: User | null;
  isLogin: boolean;
  setUser: (user: User) => void;
  setIsLogin: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLogin: false,
      setUser: (user) => set({ user, isLogin: true }), // login
      setIsLogin: (value) => set({ isLogin: value }),  // manual control
      logout: () => set({ user: null, isLogin: false }), // logout
    }),
    {
      name: 'quickfix-user', // localStorage key
    }
  )
);
