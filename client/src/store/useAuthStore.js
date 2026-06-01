import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      setAuth: (token, user) => {
        localStorage.setItem('alimony_token', token);
        set({ token, user });
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          get().setAuth(data.token, data.user);
          return data.user;
        } finally {
          set({ loading: false });
        }
      },

      register: async (payload) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', payload);
          get().setAuth(data.token, data.user);
          return data.user;
        } finally {
          set({ loading: false });
        }
      },

      fetchMe: async () => {
        const token = get().token || localStorage.getItem('alimony_token');
        if (!token) return null;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, token });
          return data.user;
        } catch {
          get().logout();
          return null;
        }
      },

      logout: () => {
        localStorage.removeItem('alimony_token');
        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    { name: 'alimony-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
