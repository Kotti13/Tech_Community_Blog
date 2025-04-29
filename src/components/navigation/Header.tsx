import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, BellDot, User as UserIcon, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { LuUser } from "react-icons/lu";


// import Toggle from './ui/Toggle.jsx'; 

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-[#040506] shadow-sm z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary-500 text-cyan-400">TechWorld</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 transition">Home</Link>
          <Link to="/explore" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 transition">Explore</Link>
          <Link to="/bookmarks" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400 transition">Bookmarks</Link>
        </nav>

        {/* Search, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          {/* Search Button */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded hover:bg-neutral-100 dark:hover:bg"
            aria-label="Search"
          >
            <Search size={20} className="text-neutral-600 dark:text-neutral-300" />
          </button>

          {/* Theme Toggle */}
         
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-[#fffff] transition"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun size={20} className="text-neutral-400" />
            ) : (
              <Moon size={20} className="text-neutral-600" />
            )}
          </button>

          {/* Notifications Button (for authenticated users) */}
          {user && (
            <button 
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition relative"
              aria-label="Notifications"
            >
              <BellDot size={20} className="text-neutral-600 dark:text-neutral-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}

          {/* User Menu or Auth Links */}
          {user ? (
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="flex items-center"
                aria-label="User menu"
              >
                
                <div className="w-8 h-5 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    // <UserIcon  />
                    <LuUser size={18} className="text-primary-500"/>                    
                    
                  )}
                 
                </div>
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-md py-2 z-50"
                  >
                    <Link to={`/profile/${user.uid}`} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      Your Profile
                    </Link>
                    <Link to="/create-post" className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      Create Post
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      Settings
                    </Link>
                    <button 
                      onClick={signOut} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="px-4 py-2 text-primary-500 hover:text-primary-600 transition">
                Log In
              </Link>
              <Link to="/signup" className="btn-17 px-4 py-2  rounded-md transition">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="p-2 md:hidden rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-neutral-800 shadow-md"
          >
            <div className="py-4 px-4 space-y-2">
              <Link to="/" className="block py-2 text-neutral-600 dark:text-neutral-300">Home</Link>
              <Link to="/explore" className="block py-2 text-neutral-600 dark:text-neutral-300">Explore</Link>
              <Link to="/bookmarks" className="block py-2 text-neutral-600 dark:text-neutral-300">Bookmarks</Link>
              {user && (
                <>
                  <Link to={`/profile/${user.uid}`} className="block py-2 text-neutral-600 dark:text-neutral-300">Your Profile</Link>
                  <Link to="/create-post" className="block py-2 text-neutral-600 dark:text-neutral-300">Create Post</Link>
                  <Link to="/settings" className="block py-2 text-neutral-600 dark:text-neutral-300">Settings</Link>
                  <button onClick={signOut} className="block w-full text-left py-2 text-red-500">
                    <span className="flex items-center"><LogOut size={16} className="mr-2" /> Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden mx-4"
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center p-4">
                <Search size={20} className="text-neutral-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts, hashtags, or users..."
                  className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-neutral-800 dark:text-neutral-100"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <X size={20} className="text-neutral-500" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;