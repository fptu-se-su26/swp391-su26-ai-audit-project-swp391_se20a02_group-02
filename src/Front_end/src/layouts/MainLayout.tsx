import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalNavbar from '@/components/layout/GlobalNavbar';
import { ToastContainer } from '@/components/ui/Toast';
import { pageVariants, pageTransition } from '@/animations/variants';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  // Paths that must automatically hide the navbar
  const hideNavbarPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ];

  const shouldHideNavbar = hideNavbarPaths.some(
    path => location.pathname === path || location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!shouldHideNavbar && <GlobalNavbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={pageTransition}
          className="flex-1 flex flex-col"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
