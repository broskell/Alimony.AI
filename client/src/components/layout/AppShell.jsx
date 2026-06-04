import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Toast from '../ui/Toast';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function AppShell({ withSidebar = true }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!withSidebar) {
    return (
      <>
        <Navbar />
        <Outlet />
        <Toast />
      </>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <div className="lg:hidden">
          <Navbar minimal onMenuClick={() => setMobileSidebarOpen(true)} />
        </div>
        <motion.main
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 overflow-auto p-4 md:p-8"
        >
          <motion.div variants={item}>
            <Outlet />
          </motion.div>
        </motion.main>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex w-64 flex-col lg:hidden"
            >
              <Sidebar
                className="flex h-full w-full flex-col p-4"
                onLinkClick={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Toast />
    </div>
  );
}
