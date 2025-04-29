import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#040506] border-t border-neutral-200 dark:border-neutral-700 mt-auto z-40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="text-xl font-bold text-primary-500 mb-4 inline-block">
              TechWorld
            </Link>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md">
              A modern, multi-fronted community blog where users can write, read, and engage with tech and world-related posts.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">
                <Github size={20} />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-neutral-800 dark:text-neutral-200 mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">Home</Link></li>
              <li><Link to="/explore" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">Explore</Link></li>
              <li><Link to="/trending" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">Trending</Link></li>
              <li><Link to="/bookmarks" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">Bookmarks</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-neutral-800 dark:text-neutral-200 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">About Us</Link></li>
              <li><Link to="/privacy" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            &copy; {year} TechWorld Community. All rights reserved.
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart size={14} className="inline mx-1 text-red-500" /> by TechWorld Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;