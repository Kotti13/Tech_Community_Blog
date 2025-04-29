import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import PostList from '../components/posts/PostList';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Post } from '../types/post';
import { motion } from 'framer-motion';
import '../Css/Button.css';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'for-you' | 'latest'>('for-you');

  // Fetch posts using React Query
  const { data: posts, isLoading, refetch } = useQuery(
    ['posts', activeTab],
    async () => {
      let postsQuery;
      
      if (activeTab === 'for-you' && user) {
        // For authenticated users, try to show personalized content
        // In a real app, this would be more sophisticated
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
      } else {
        // For non-authenticated users or 'latest' tab
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
      }
      
      const querySnapshot = await getDocs(postsQuery);
      const postsData: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      return postsData;
    },
    {
      enabled: true, // Query runs automatically
      refetchOnWindowFocus: false,
    }
  );

  // Handle post like action
  const handleLike = async (postId: string) => {
    if (!user) return;
    
    const postRef = doc(db, 'posts', postId);
    const isLiked = posts?.find(post => post.id === postId)?.likes.includes(user.uid);
    
    if (isLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(user.uid)
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(user.uid)
      });
    }
    
    // Refetch posts to update UI
    refetch();
  };

  // Handle post bookmark action
  const handleBookmark = async (postId: string) => {
    if (!user) return;
    
    const postRef = doc(db, 'posts', postId);
    const isBookmarked = posts?.find(post => post.id === postId)?.bookmarkedBy?.includes(user.uid);
    
    if (isBookmarked) {
      await updateDoc(postRef, {
        bookmarkedBy: arrayRemove(user.uid)
      });
    } else {
      await updateDoc(postRef, {
        bookmarkedBy: arrayUnion(user.uid)
      });
    }
    
    // Refetch posts to update UI
    refetch();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">Home</h1>
        
        {/* Tab navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-6">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'for-you'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('latest')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'latest'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Latest
          </button>
        </div>
        
        {/* Content area */}
        <div className="md:pl-0 md:pr-6">
          <PostList 
            posts={posts || []} 
            onLike={handleLike} 
            onBookmark={handleBookmark} 
            isLoading={isLoading}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;