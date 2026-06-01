import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useEffect } from 'react';

export default function Toast() {
  const { toast, hideToast } = useAppStore();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 4000);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg px-5 py-3 text-sm shadow-lg"
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
          }}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
