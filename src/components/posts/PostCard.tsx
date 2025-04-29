import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Post } from '../../types/post';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onBookmark }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuth();
  
  const isLiked = user && post.likes.includes(user.uid);
  const isBookmarked = user && post.bookmarkedBy?.includes(user.uid);
  
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  const handleLike = () => {
    if (user) {
      onLike(post.id);
    }
  };
  
  const handleBookmark = () => {
    if (user) {
      onBookmark(post.id);
    }
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: truncateText(post.content, 100),
          url: postUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        copyToClipboard(postUrl);
      }
    } else {
      copyToClipboard(postUrl);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Link copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl shadow-xl mb-8"
    >
      {/* Animated Moving Gradient Background */}
      <motion.div
        initial={{ backgroundPosition: '0% 50%' }}
        animate={{ backgroundPosition: '100% 50%' }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:400%_400%] opacity-30"
      />

      {/* Main Card Content */}
      <div className="relative z-10">

        {/* Post Header */}
        <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-t-2xl border-b border-neutral-300 dark:border-neutral-700">
          <div className="flex items-center space-x-4">
            <Link to={`/profile/${post.authorId}`} className="block">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                {post.authorPhotoURL ? (
                  <img src={post.authorPhotoURL} alt={post.authorName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary-600 dark:text-primary-400">
                    {post.authorName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            <div>
              <Link to={`/profile/${post.authorId}`} className="font-semibold text-neutral-800 dark:text-neutral-100 hover:text-primary-500">
                {post.authorName}
              </Link>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{formattedDate}</p>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <MoreHorizontal size={20} className="text-neutral-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-md z-20 border border-neutral-200 dark:border-neutral-700">
                <button 
                  onClick={() => {
                    copyToClipboard(`${window.location.origin}/post/${post.id}`);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  Copy link
                </button>
                {user && user.uid === post.authorId && (
                  <>
                    <Link
                      to={`/edit-post/${post.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      Edit Post
                    </Link>
                    <button 
                      onClick={() => {
                        // Add delete logic
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      Delete Post
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setShowDropdown(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  Report Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Body */}
        <Link to={`/post/${post.id}`} className="block hover:opacity-90 transition">
          <div className="p-4 bg-white/30 dark:bg-black/30 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">{post.title}</h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-4">{truncateText(post.content, 200)}</p>

            {post.imageUrl && (
              <div className="rounded-lg overflow-hidden mb-4">
                <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover max-h-96" />
              </div>
            )}

            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.hashtags.map(tag => (
                  <Link 
                    key={tag}
                    to={`/hashtag/${tag}`}
                    className="text-primary-500 text-sm hover:text-primary-600 dark:hover:text-primary-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Post Actions */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-b-2xl">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400 hover:text-red-500'}`}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              <span>{post.likes.length}</span>
            </button>

            <Link 
              to={`/post/${post.id}`}
              className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400 hover:text-primary-500"
            >
              <MessageCircle size={20} />
              <span>{post.comments.length}</span>
            </Link>

            <button 
              onClick={handleShare}
              className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400 hover:text-primary-500"
            >
              <Share2 size={20} />
            </button>
          </div>

          <button 
            onClick={handleBookmark}
            className={`flex items-center ${isBookmarked ? 'text-primary-500' : 'text-neutral-500 dark:text-neutral-400 hover:text-primary-500'}`}
          >
            <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
          </button>
        </div>

      </div>
    </motion.article>
  );
};

export default PostCard;
