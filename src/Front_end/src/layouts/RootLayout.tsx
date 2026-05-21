import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { ToastContainer } from '@/components/ui/Toast';
import { pageVariants, pageTransition } from '@/animations/variants';

export const RootLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={pageTransition}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <ToastContainer />
    </div>
  );
};

export default RootLayout;
