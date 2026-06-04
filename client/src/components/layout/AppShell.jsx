import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Toast from '../ui/Toast';
import { Sheet, SheetContent } from '../ui/sheet';
import MobileSidebarContent from './MobileSidebarContent';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close mobile drawer on route navigation changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

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
      {/* Desktop sidebar: only mount when viewport width is 1024px or wider */}
      {!isMobile && <Sidebar />}

      <div className="flex flex-1 flex-col">
        {/* Mobile Navbar: only mount when viewport width is below 1024px */}
        {isMobile && (
          <div className="lg:hidden">
            <Navbar minimal onMenuClick={() => setMobileSidebarOpen(true)} />
          </div>
        )}
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

      {isMobile && (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
            <MobileSidebarContent onClose={() => setMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      <Toast />
    </div>
  );
}
