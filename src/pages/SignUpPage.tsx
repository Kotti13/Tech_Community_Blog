import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import SignUpForm from '../components/auth/SignUpForm';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const SignUpPage: React.FC = () => {
  const { user } = useAuth();
  
  // If user is already authenticated, redirect to the home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      <header className="py-4 px-6 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary-500">
            TechWorld
          </Link>
        </div>
      </header>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </motion.div>
      
      <footer className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>&copy; {new Date().getFullYear()} TechWorld Community. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignUpPage;