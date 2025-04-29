import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../navigation/Header';
import Footer from '../navigation/Footer';
import Sidebar from '../navigation/Sidebar';
import { motion } from 'framer-motion';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#040506] text-neutral-800 dark:text-neutral-100 flex flex-col">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <motion.main
          className="flex-1 px-4 md:px-8 py-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;