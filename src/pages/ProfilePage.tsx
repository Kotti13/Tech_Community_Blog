import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, Link as LinkIcon, Edit, Users, Settings, ArrowLeft } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Post } from '../types/post';
import { User as UserType } from '../types/user';
import PostList from '../components/posts/PostList';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
    
  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile, error } = useQuery(
    ['profile', id],
    async () => {
      if (!id) return null;
      const userDoc = await getDoc(doc(db, 'users', id));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      return { uid: userDoc.id, ...userDoc.data() } as UserType;
    },
    {
      enabled: !!id,
      retry: false,
    }
  );
  
  if (error) {
    console.error("Error fetching profile:", error);
  }
  
  
  // Fetch user posts
  const { data: posts, isLoading: isLoadingPosts, refetch: refetchPosts } = useQuery(
    ['profile-posts', id, activeTab],
    async () => {
      if (!id) return [];
      
      let postsQuery;
      
      if (activeTab === 'posts') {
        // Fetch posts authored by this user
        postsQuery = query(
          collection(db, 'posts'),
          where('authorId', '==', id),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Fetch posts liked by this user
        // This is more complex and might require a different approach in a real app
        // For simplicity, we'll just return an empty array for now
        return [];
      }
      
      const querySnapshot = await getDocs(postsQuery);
      const postsData: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      
      return postsData;
    },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );
  
  const isCurrentUser = user?.uid === id;
  const isFollowing = user && profile?.followers?.includes(user.uid);
  
  const handleFollow = async () => {
    if (!user || !profile || !id) return;
    
    const userRef = doc(db, 'users', id);
    const currentUserRef = doc(db, 'users', user.uid);
    
    try {
      if (isFollowing) {
        // Unfollow
        await updateDoc(userRef, {
          followers: arrayRemove(user.uid)
        });
        
        await updateDoc(currentUserRef, {
          following: arrayRemove(id)
        });
      } else {
        // Follow
        await updateDoc(userRef, {
          followers: arrayUnion(user.uid)
        });
        
        await updateDoc(currentUserRef, {
          following: arrayUnion(id)
        });
      }
      
      // Refetch profile to update UI
      // In a real app, you would use a more efficient approach
      window.location.reload();
    } catch (err) {
      console.error('Error updating follow status:', err);
    }
  };
  
  // Handle post like action
  const handleLike = async (postId: string) => {
    if (!user) return;
    
    const postRef = doc(db, 'posts', postId);
    const post = posts?.find(p => p.id === postId);
    
    if (!post) return;
    
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
    
    const postRef = doc(db, 'posts', postId);
    const post = posts?.find(p => p.id === postId);
    
    if (!post) return;
    
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

  if (isLoadingProfile) {
    return (
      <div className="max-w-5xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">User Not Found</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="flex items-center text-primary-500 hover:text-primary-600">
            <ArrowLeft size={18} className="mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Profile Banner */}
          <div className="h-48 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
          
          <div className="p-6 relative">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-white dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-4xl font-bold">
                  {profile.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            {/* Profile Actions */}
            <div className="flex justify-end mb-12">
              {isCurrentUser ? (
                <Link 
                  to="/settings"
                  className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-md transition-colors"
                >
                  <Settings size={18} className="mr-2" />
                  Edit Profile
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    isFollowing 
                      ? 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  <Users size={18} className="mr-2" />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            
            {/* Profile Info */}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {profile.displayName || 'User'}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                @{profile.displayName?.toLowerCase().replace(/\s+/g, '') || 'user'}
              </p>
              
              {profile.bio && (
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex flex-wrap items-center text-sm text-neutral-500 dark:text-neutral-400 mb-4 gap-y-2">
              {profile.createdAt && !isNaN(new Date(profile.createdAt).getTime()) && (
  <div className="flex items-center mr-6">
    <Calendar size={16} className="mr-2" />
    Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
  </div>
)}

                
                {profile.location && (
                  <div className="flex items-center mr-6">
                    <MapPin size={16} className="mr-2" />
                    {profile.location}
                  </div>
                )}
                
                {profile.website && (
                  <div className="flex items-center mr-6">
                    <LinkIcon size={16} className="mr-2" />
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-600 hover:underline"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex items-center text-sm">
                <div className="mr-6">
                  <span className="font-bold text-neutral-900 dark:text-neutral-50">{profile.following?.length || 0}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-1">Following</span>
                </div>
                
                <div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-50">{profile.followers?.length || 0}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-1">Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'likes'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Likes
          </button>
        </div>
        
        {/* Post List */}
        <div className="space-y-6">
          <PostList 
            posts={posts || []} 
            onLike={handleLike} 
            onBookmark={handleBookmark} 
            isLoading={isLoadingPosts}
          />
          
          {!isLoadingPosts && posts?.length === 0 && (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
              <h3 className="text-xl font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                No posts yet
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                {isCurrentUser 
                  ? 'You haven\'t posted anything yet. Create your first post!'
                  : `${profile.displayName || 'This user'} hasn't posted anything yet.`}
              </p>
              
              {isCurrentUser && (
                <Link
                  to="/create-post"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow-sm transition-colors"
                >
                  <Edit size={18} className="mr-2" />
                  Create Post
                </Link>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;