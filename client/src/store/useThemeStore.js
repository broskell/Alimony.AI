import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      initTheme: () => {
        const theme = get().theme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
      },
    }),
    { name: 'alimony-theme' }
  )
);
