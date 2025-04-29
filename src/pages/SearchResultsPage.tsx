import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, User, Hash, FileText } from 'lucide-react';
import { useQuery } from 'react-query';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Post } from '../types/post';
import { User as UserType } from '../types/user';
import PostList from '../components/posts/PostList';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'hashtags'>('posts');
  
  useEffect(() => {  
    setActiveTab('posts');
  }, [searchQuery]);
  
  // Search posts
  const { data: posts, isLoading: isLoadingPosts, refetch: refetchPosts } = useQuery(
    ['search-posts', searchQuery],
    async () => {
      if (!searchQuery) return [];
      
      // In a real app, you would use a more sophisticated search mechanism
      // For this example, we're doing a simple title/content search
      const postsRef = collection(db, 'posts');
      const postsSnapshot = await getDocs(postsRef);
      
      const results: Post[] = [];
      
      postsSnapshot.forEach(doc => {
        const post = { id: doc.id, ...doc.data() } as Post;
        
        // Check if post title or content contains the search query
        if (
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          results.push(post);
        }
      });
      
      // Sort by createdAt
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return results;
    },
    {
      enabled: !!searchQuery && activeTab === 'posts',
      refetchOnWindowFocus: false,
    }
  );
  
  // Search users
  const { data: users, isLoading: isLoadingUsers } = useQuery(
    ['search-users', searchQuery],
    async () => {
      if (!searchQuery) return [];
      
      // In a real app, you would use a more sophisticated search mechanism
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const results: UserType[] = [];
      
      usersSnapshot.forEach(doc => {
        const user = { uid: doc.id, ...doc.data() } as UserType;
        
        // Check if user displayName or email contains the search query
        if (
          user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push(user);
        }
      });
      
      return results;
    },
    {
      enabled: !!searchQuery && activeTab === 'users',
      refetchOnWindowFocus: false,
    }
  );
  
  // Search hashtags
  const { data: hashtags, isLoading: isLoadingHashtags } = useQuery(
    ['search-hashtags', searchQuery],
    async () => {
      if (!searchQuery) return [];
      
      // In a real app, you would have a hashtags collection or use a more efficient approach
      // For this example, we'll extract unique hashtags from posts
      const postsRef = collection(db, 'posts');
      const postsSnapshot = await getDocs(postsRef);
      
      const allHashtags = new Set<string>();
      
      postsSnapshot.forEach(doc => {
        const post = doc.data() as Post;
        post.hashtags.forEach(tag => {
          if (tag.toLowerCase().includes(searchQuery.toLowerCase())) {
            allHashtags.add(tag);
          }
        });
      });
      
      return Array.from(allHashtags).sort();
    },
    {
      enabled: !!searchQuery && activeTab === 'hashtags',
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
      refetchPosts();
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
      refetchPosts();
    } catch (err) {
      console.error('Error updating bookmarks:', err);
    }
  };

  const isLoading = 
    (activeTab === 'posts' && isLoadingPosts) || 
    (activeTab === 'users' && isLoadingUsers) || 
    (activeTab === 'hashtags' && isLoadingHashtags);

  const hasResults = 
    (activeTab === 'posts' && posts && posts.length > 0) || 
    (activeTab === 'users' && users && users.length > 0) || 
    (activeTab === 'hashtags' && hashtags && hashtags.length > 0);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center">
            <Search size={24} className="mr-2 text-primary-500" />
            Search Results
          </h1>
          {searchQuery && (
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              Showing results for: <span className="font-medium text-neutral-700 dark:text-neutral-300">"{searchQuery}"</span>
            </p>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center px-4 py-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <FileText size={16} className="mr-2" />
            Posts
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <User size={16} className="mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('hashtags')}
            className={`flex items-center px-4 py-2 font-medium text-sm ${
              activeTab === 'hashtags'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Hash size={16} className="mr-2" />
            Hashtags
          </button>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        )}
        
        {/* No results message */}
        {!isLoading && !hasResults && searchQuery && (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <Search size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <h3 className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              No results found
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              {activeTab === 'posts' && "We couldn't find any posts matching your search."}
              {activeTab === 'users' && "We couldn't find any users matching your search."}
              {activeTab === 'hashtags' && "We couldn't find any hashtags matching your search."}
            </p>
          </div>
        )}
        
        {/* Posts results */}
        {activeTab === 'posts' && !isLoading && posts && (
          <PostList
            posts={posts}
            onLike={handleLike}
            onBookmark={handleBookmark}
          />
        )}
        
        {/* Users results */}
        {activeTab === 'users' && !isLoading && users && users.length > 0 && (
          <div className="space-y-4">
            {users.map(user => (
              <Link
                key={user.uid}
                to={`/profile/${user.uid}`}
                className="flex items-center p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mr-4">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-bold">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {user.displayName || 'User'}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {user.email}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Hashtags results */}
        {activeTab === 'hashtags' && !isLoading && hashtags && hashtags.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hashtags.map(tag => (
              <Link
                key={tag}
                to={`/hashtag/${tag}`}
                className="flex items-center p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-500 mr-3">
                  <Hash size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                    #{tag}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SearchResultsPage;