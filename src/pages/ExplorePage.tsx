import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Filter } from 'lucide-react';
import { useQuery } from 'react-query';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Post } from '../types/post';
import PostList from '../components/posts/PostList';
import { useAuth } from '../hooks/useAuth';

const ExplorePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // These would typically come from a database
  const categories = [
    'All',
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'Data Science',
    'Web Development',
    'Mobile',
    'DevOps'
  ];

  // Fetch posts using React Query
  const { data: posts, isLoading, refetch } = useQuery(
    ['explore-posts', selectedCategory],
    async () => {
      let postsQuery;
      
      if (selectedCategory && selectedCategory !== 'All') {
        // If a category is selected, filter by that hashtag
        postsQuery = query(
          collection(db, 'posts'),
          where('hashtags', 'array-contains', selectedCategory.toLowerCase()),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      } else {
        // Otherwise, get the most recent posts
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      }
      
      try {
        const querySnapshot = await getDocs(postsQuery);
        const postsData: Post[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        
        return postsData;
      } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
      }
    },
    {
      enabled: true, // Query runs automatically
      refetchOnWindowFocus: false,
    }
  );

  // Handle post like action
  const handleLike = async (postId: string) => {
    if (!user) return;
    // Implementation would be similar to the HomePage
    // For now, just refetch to update UI
    refetch();
  };

  // Handle post bookmark action
  const handleBookmark = async (postId: string) => {
    if (!user) return;
    // Implementation would be similar to the HomePage
    // For now, just refetch to update UI
    refetch();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center">
            <Compass size={24} className="mr-2 text-primary-500" />
            Explore
          </h1>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Filter size={18} className="mr-2" />
            Filters
          </button>
        </div>
        
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      (category === 'All' && !selectedCategory) || category === selectedCategory
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="space-y-6">
          <PostList 
            posts={posts || []} 
            onLike={handleLike} 
            onBookmark={handleBookmark} 
            isLoading={isLoading}
          />
          
          {!isLoading && posts?.length === 0 && (
            <div className="text-center py-12">
              <Compass size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
              <h3 className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                No posts found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                {selectedCategory 
                  ? `We couldn't find any posts with the hashtag #${selectedCategory.toLowerCase()}`
                  : 'There are no posts to explore right now. Check back later!'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ExplorePage;