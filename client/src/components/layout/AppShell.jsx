import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
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
          <Navbar minimal />
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
      <Toast />
    </div>
  );
}
