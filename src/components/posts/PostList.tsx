import React from 'react';
import PostCard from './PostCard';
import { Post } from '../../types/post';
import { motion } from 'framer-motion';

interface PostListProps {
  posts: Post[];
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  isLoading?: boolean;
}

const PostList: React.FC<PostListProps> = ({ posts, onLike, onBookmark, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 ">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
            <div className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="h-6 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              <div className="h-48 w-full bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
            <div className="px-4 py-3 flex justify-between ">
              <div className="flex space-x-4">
                <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                <div className="h-5 w-8 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
              <div className="h-5 w-5 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <h3 className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-2">No posts yet</h3>
        <p className="text-neutral-500 dark:text-neutral-400">Be the first to create a post or follow more users to see their content here.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onLike={onLike} 
          onBookmark={onBookmark} 
        />
      ))}
    </div>
  );
};

export default PostList;