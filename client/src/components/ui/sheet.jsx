import { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const SheetContext = createContext(null);

export function Sheet({ open, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  return (
    <SheetContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children, asChild }) {
  const { setIsOpen } = useContext(SheetContext);
  
  if (asChild) {
    const child = children;
    return (
      <child.type
        {...child.props}
        onClick={(e) => {
          child.props.onClick?.(e);
          setIsOpen(true);
        }}
      />
    );
  }

  return (
    <button type="button" onClick={() => setIsOpen(true)}>
      {children}
    </button>
  );
}

export function SheetContent({ children, side = 'left', className = '' }) {
  const { isOpen, setIsOpen } = useContext(SheetContext);

  const slideVariants = {
    left: {
      hidden: { x: '-100%' },
      visible: { x: 0 },
      exit: { x: '-100%' },
    },
    right: {
      hidden: { x: '100%' },
      visible: { x: 0 },
      exit: { x: '100%' },
    },
  };

  // Prevent background scroll and touch interactions when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex pointer-events-none lg:hidden">
          {/* Overlay - z-[9998] */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sliding Content Container - z-[9999] */}
          <motion.div
            variants={slideVariants[side]}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed left-0 top-0 h-screen w-72 max-w-[85vw] z-[9999] flex flex-col shadow-2xl border-r pointer-events-auto ${className}`}
            style={{ 
              background: 'var(--bg-surface)', 
              borderColor: 'var(--border-subtle)',
            }}
          >
            {/* Close button at top-right of panel */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-overlay)] cursor-pointer text-[var(--text-secondary)] z-50"
              aria-label="Close menu"
            >
              <Icon name="close" size={20} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
