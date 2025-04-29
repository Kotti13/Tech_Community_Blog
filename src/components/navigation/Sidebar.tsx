import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Hash, Bookmark, Users, Settings, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Popular hashtags (in a real app, these would be fetched from the database)
  const popularHashtags = [
    'javascript',
    'react',
    'webdev',
    'aws',
    'machinelearning',
    'blockchain'
  ];

  return (
    <motion.aside 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="hidden md:flex flex-col w-64 border-r border-[#515159] dark:border-[#515159] h-[calc(100vh-64px)] fixed top-16 left-0 overflow-y-auto bg-white dark:bg-[#040506] py-6 px-4"
    >
      <nav className="space-y-1">
        <Link to="/" className={`flex items-center space-x-3 px-3 py-2 rounded-md ${isActive('/') ? 'bg-primary-50 dark:bg-[#374248] text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        
        <Link to="/explore" className={`flex items-center space-x-3 px-3 py-2 rounded-md ${isActive('/explore') ? 'bg-primary-50 dark:bg-[#374248] text-primary-white dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
          <Compass size={20} />
          <span>Explore</span>
        </Link>
        
        <Link to="/bookmarks" className={`flex items-center space-x-3 px-3 py-2 rounded-md ${isActive('/bookmarks') ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
          <Bookmark size={20} />
          <span>Bookmarks</span>
        </Link>
        
        {user && (
          <>
            <Link to="/following" className={`flex items-center space-x-3 px-3 py-2 rounded-md ${isActive('/following') ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
              <Users size={20} />
              <span>Following</span>
            </Link>
            
            <Link to="/settings" className={`flex items-center space-x-3 px-3 py-2 rounded-md ${isActive('/settings') ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </>
        )}
      </nav>
      
      {user && (
        <Link 
          to="/create-post"
          className="mt-6 bg-[#374248] hover:bg-primary-300 text-white px-3 py-2 rounded-md flex items-center justify-center transition-colors"
        >
          <PlusCircle size={18} className="mr-2" />
          <span>Create Post</span>
        </Link>
      )}
      
      <div className="mt-8">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
          Popular Hashtags
        </h3>
        <div className="space-y-2">
          {popularHashtags.map(tag => (
            <Link 
              key={tag}
              to={`/hashtag/${tag}`}
              className="flex items-center space-x-2 text-neutral-700 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 px-3 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <Hash size={16} />
              <span>{tag}</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;