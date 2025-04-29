import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, TrendingUp, ArrowLeft } from 'lucide-react';
import { useQuery } from 'react-query';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Post } from '../types/post';
import PostList from '../components/posts/PostList';

const HashtagPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const { user } = useAuth();
  
  // Fetch posts by hashtag
  const { data: posts, isLoading, refetch } = useQuery(
    ['hashtag-posts', tag],
    async () => {
      if (!tag) return [];
      
      const postsQuery = query(
        collection(db, 'posts'),
        where('hashtags', 'array-contains', tag.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const postsData: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      return postsData;
    },
    {
      enabled: !!tag,
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
    
    const post = posts?.find(p => p.id === postId);
    if (!post) return;
    
    const postRef = doc(db, 'posts', postId);
    const isBookmarked = post.bookmarkedBy?.includes(user.uid);
    
    try {
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
    } catch (err) {
      console.error('Error updating bookmarks:', err);
    }
  };
  
  // Related hashtags (this would come from a database in a real app)
  const relatedHashtags = [
    'javascript',
    'webdev',
    'programming',
    'technology',
    'coding'
  ].filter(t => t !== tag);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <Link to="/explore" className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Back to Explore
          </Link>
          
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-500 mr-4">
              <Hash size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">#{tag}</h1>
              <p className="text-neutral-500 dark:text-neutral-400">
                {posts?.length || 0} {posts?.length === 1 ? 'post' : 'posts'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <PostList 
              posts={posts || []} 
              onLike={handleLike} 
              onBookmark={handleBookmark} 
              isLoading={isLoading}
            />
            
            {!isLoading && posts?.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                <Hash size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
                <h3 className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  No posts found
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                  There are no posts with the hashtag #{tag} yet.
                </p>
                {user && (
                  <Link
                    to="/create-post"
                    className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow-sm transition-colors"
                  >
                    Be the first to post
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center">
                  <TrendingUp size={18} className="mr-2 text-primary-500" />
                  Related Hashtags
                </h3>
              </div>
              <div className="p-4">
                {relatedHashtags.length > 0 ? (
                  <div className="space-y-2">
                    {relatedHashtags.map(relatedTag => (
                      <Link
                        key={relatedTag}
                        to={`/hashtag/${relatedTag}`}
                        className="flex items-center px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                      >
                        <Hash size={16} className="mr-2 text-neutral-500" />
                        {relatedTag}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                    No related hashtags found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HashtagPage;