import { create } from 'zustand';

export const useAppStore = create((set) => ({
  toast: null,
  lastCalculation: null,
  lastInput: null,

  showToast: (message, type = 'info') => set({ toast: { message, type, id: Date.now() } }),
  hideToast: () => set({ toast: null }),

  setCalculation: (result, input) => set({ lastCalculation: result, lastInput: input }),
}));
