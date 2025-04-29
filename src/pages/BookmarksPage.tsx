import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useQuery } from 'react-query';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Post } from '../types/post';
import PostList from '../components/posts/PostList';

const BookmarksPage: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch bookmarked posts
  const { data: posts, isLoading, refetch } = useQuery(
    ['bookmarked-posts'],
    async () => {
      if (!user) return [];
      
      // In a real app, this query would be more efficient with a proper database structure
      // For this example, we're querying all posts and filtering by bookmarkedBy
      const postsQuery = query(
        collection(db, 'posts'),
        where('bookmarkedBy', 'array-contains', user.uid)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const postsData: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      return postsData;
    },
    {
      enabled: !!user,
      refetchOnWindowFocus: false,
    }
  );
  
  // Handle post like action
  const handleLike = async (postId: string) => {
    if (!user) return;
    
    const post = posts?.find(p => p.id === postId);
    if (!post) return;
    
    const postRef = doc(db, 'posts', postId);
    const isLiked = post.likes.includes(user.uid);
    
    try {
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
    } catch (err) {
      console.error('Error updating likes:', err);
    }
  };
  
  // Handle post bookmark action
  const handleBookmark = async (postId: string) => {
    if (!user) return;
    
    const postRef = doc(db, 'posts', postId);
    
    try {
      // Remove from bookmarks
      await updateDoc(postRef, {
        bookmarkedBy: arrayRemove(user.uid)
      });
      
      // Refetch posts to update UI
      refetch();
    } catch (err) {
      console.error('Error updating bookmarks:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <Bookmark size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">Your Bookmarks</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Please sign in to view your bookmarked posts.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-6 flex items-center">
          <Bookmark size={24} className="mr-2 text-primary-500" />
          Your Bookmarks
        </h1>
        
        <PostList 
          posts={posts || []} 
          onLike={handleLike} 
          onBookmark={handleBookmark} 
          isLoading={isLoading}
        />
        
        {!isLoading && posts?.length === 0 && (
          <div className="text-center py-12">
            <Bookmark size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <h3 className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              No bookmarks yet
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              You haven't bookmarked any posts yet. Click the bookmark icon on posts you want to save for later.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BookmarksPage;