import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { formatDistanceToNow } from "date-fns";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import { Post, Comment } from "../types/post";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeft,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import useFilteredContent from '../hooks/parsePostContent'
interface CommentFormData {
  content: string;
}

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>();

  // Fetch post details
  const {
    data: post,
    isLoading,
    refetch,
  } = useQuery(
    ["post", id],
    async () => {
      if (!id) return null;

      try {
        const postDoc = await getDoc(doc(db, "posts", id));

        if (!postDoc.exists()) {
          throw new Error("Post not found");
        }

        return { id: postDoc.id, ...postDoc.data() } as Post;
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(
          "Could not load the post. It may have been deleted or you may not have permission to view it."
        );
        return null;
      }
    },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  const handleLike = async () => {
    if (!user || !post || !id) return;

    const postRef = doc(db, "posts", id);
    const isLiked = post.likes.includes(user.uid);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
        });
      }

      refetch();
    } catch (err) {
      console.error("Error updating likes:", err);
    }
  };

  const handleBookmark = async () => {
    if (!user || !post || !id) return;

    const postRef = doc(db, "posts", id);
    const isBookmarked = post.bookmarkedBy?.includes(user.uid);

    try {
      if (isBookmarked) {
        await updateDoc(postRef, {
          bookmarkedBy: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(postRef, {
          bookmarkedBy: arrayUnion(user.uid),
        });
      }

      refetch();
    } catch (err) {
      console.error("Error updating bookmarks:", err);
    }
  };

  const handleShare = async () => {
    const postUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "TechWorld Post",
          text:
            post?.content.substring(0, 100) ||
            "Check out this post on TechWorld!",
          url: postUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        // Fallback to copy to clipboard
        copyToClipboard(postUrl);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      copyToClipboard(postUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Link copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err));
  };

  const onSubmitComment = async (data: CommentFormData) => {
    if (!user || !post || !id) return;
    
    try {
      const postRef = doc(db, 'posts', id);
      
      const newComment: any = {
        content: data.content,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: new Date().toISOString(),
        likes: []
      };
      
      if (user.photoURL) {
        newComment.authorPhotoURL = user.photoURL;
      }
  
      // In a real app, you might use a subcollection for comments
      // For simplicity, we'll update the post document directly
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      
      reset();
      refetch();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };
    

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Error
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error || "Post not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-500 hover:text-primary-600"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isLiked = user && post.likes.includes(user.uid);
  const isBookmarked = user && post.bookmarkedBy?.includes(user.uid);

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </button>

        {/* Post Content */}
        <article className="bg-white dark:bg-[#252525] rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            {/* Author info */}
            <div className="flex items-center mb-6">
              <Link to={`/profile/${post.authorId}`} className="block">
                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  {post.authorPhotoURL ? (
                    <img
                      src={post.authorPhotoURL}
                      alt={post.authorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-lg font-bold">
                      {post.authorName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <div className="ml-4">
                <Link
                  to={`/profile/${post.authorId}`}
                  className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-500 dark:hover:text-primary-400"
                >
                  {post.authorName}
                </Link>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Post title and content */}
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
              {post.title}
            </h1>

            {post.imageUrl && (
              <div className="rounded-lg overflow-hidden mb-6">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto object-cover max-h-96"
                />
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none mb-6">
              <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.hashtags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/hashtag/${tag}`}
                    className="text-primary-500 text-sm hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Post Actions */}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${
                    isLiked
                      ? "text-red-500"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-500"
                  }`}
                >
                  <Heart size={20} className={isLiked ? "fill-current" : ""} />
                  <span>{post.likes.length}</span>
                </button>

                <button className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400">
                  <MessageCircle size={20} />
                  <span>{post.comments.length}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <button
                onClick={handleBookmark}
                className={`flex items-center ${
                  isBookmarked
                    ? "text-primary-500"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400"
                }`}
              >
                <Bookmark
                  size={20}
                  className={isBookmarked ? "fill-current" : ""}
                />
              </button>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white dark:bg-[#252525] rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              Comments ({post.comments.length})
            </h2>
            
            
            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleSubmit(onSubmitComment)} className="mb-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-bold">
                          {user.displayName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="relative">
                      <textarea
                        {...register("content", {
                          required: "Comment cannot be empty",
                        })}
                        rows={3}
                        placeholder="Add a comment..."
                        className={`w-full px-4 py-2 border ${
                          errors.content
                            ? "border-red-300 dark:border-red-700"
                            : "border-neutral-300 dark:border-neutral-700"
                        } rounded-md bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-neutral-100`}
                      ></textarea>
                      {errors.content && ( 
                        <p className="mt-1 text-sm text-red-500">
                          {errors.content.message}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center px-4 py-2 bg-[#c1c1c1] hover:bg-[#929292] text-[#040506] rounded-md shadow-sm transition-colors ${
                          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        <Send size={16} className="mr-2" />
                        {isSubmitting ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md">
                <p className="text-neutral-600 dark:text-neutral-400 text-center">
                  <Link
                    to="/login"
                    className="text-primary-500 hover:text-primary-600"
                  >
                    Log in
                  </Link>{" "}
                  to add a comment
                </p>
              </div>
            )}
            {/* Comments List */}
            <div className="space-y-6">
              {post.comments.length > 0 ? (
                post.comments.map((comment, index) => (
                  <div
                    key={index}
                    className="border-b border-neutral-200 dark:border-neutral-700 pb-6 last:border-0"
                  >
                    <div className="flex items-start space-x-4">
                      <Link
                        to={`/profile/${comment.authorId}`}
                        className="flex-shrink-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                          {comment.authorPhotoURL ? (
                            <img
                              src={comment.authorPhotoURL}
                              alt={comment.authorName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-bold">
                              {comment.authorName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              to={`/profile/${comment.authorId}`}
                              className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-500 dark:hover:text-primary-400"
                            >
                              {comment.authorName}
                            </Link>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {formatDistanceToNow(
                                new Date(comment.createdAt),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                          <button className="text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300">
                            {/* Comment options button could go here */}
                          </button>
                        </div>
                        <div className="mt-2">
                          <p className="text-neutral-700 dark:text-neutral-300">
                            {comment.content}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center">
                          <button className="flex items-center text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-500 text-sm">
                            <Heart size={16} className="mr-1" />
                            <span>{comment.likes.length}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PostDetailPage;
