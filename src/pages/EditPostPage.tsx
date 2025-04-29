import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { ArrowLeft, Image, X, Tag, Loader, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../types/post';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface EditPostFormData {
  title: string;
  content: string;
  hashtags?: string;
}

const schema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters'),
  content: yup
    .string()
    .required('Content is required')
    .min(20, 'Content must be at least 20 characters'),
  hashtags: yup
    .string()
    .nullable()
    .transform((value) => (!value ? null : value))
});

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<EditPostFormData>({
    resolver: yupResolver(schema)
  });
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const postDoc = await getDoc(doc(db, 'posts', id));
        
        if (!postDoc.exists()) {
          setError('Post not found');
          setLoading(false);
          return;
        }
        
        const postData = { id: postDoc.id, ...postDoc.data() } as Post;
        
        // Check if current user is the author
        if (user?.uid !== postData.authorId) {
          setError("You don't have permission to edit this post");
          setLoading(false);
          return;
        }
        
        setPost(postData);
        
        // Prefill form values
        setValue('title', postData.title);
        setValue('content', postData.content);
        setValue('hashtags', postData.hashtags.join(', '));
        
        // Set image preview if exists
        if (postData.imageUrl) {
          setImagePreview(postData.imageUrl);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. Please try again.');
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, user, setValue]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  
  const onSubmit = async (data: EditPostFormData) => {
    if (!user || !post || !id) {
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Process hashtags
      const hashtagsArray = data.hashtags
        ? data.hashtags
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0)
        : [];
      
      let imageUrl = post.imageUrl;
      
      // Upload new image if exists
      if (imageFile) {
        const storageRef = ref(storage, `post-images/${uuidv4()}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      } else if (!imagePreview) {
        // If image was removed
        imageUrl = null;
      }
      
      // Update post document
      const postRef = doc(db, 'posts', id);
      
      await updateDoc(postRef, {
        title: data.title,
        content: data.content,
        imageUrl,
        updatedAt: new Date().toISOString(),
        hashtags: hashtagsArray,
      });
      
      // Navigate back to the post
      navigate(`/post/${id}`);
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
      setIsUploading(false);
    }
  };

  if (loading) {
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
          <div className="flex items-center mb-4 text-red-500">
            <AlertTriangle size={24} className="mr-2" />
            <h1 className="text-xl font-bold">Error</h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error || 'Post not found'}</p>
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

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>
          
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Edit Post</h1>
          
          <div className="w-24"></div> {/* Spacer for centering the title */}
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className={`w-full px-4 py-2 border ${errors.title ? 'border-red-300 dark:border-red-700' : 'border-neutral-300 dark:border-neutral-700'} rounded-md bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-neutral-100`}
                placeholder="Enter a descriptive title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Content
              </label>
              <textarea
                id="content"
                {...register('content')}
                rows={10}
                className={`w-full px-4 py-2 border ${errors.content ? 'border-red-300 dark:border-red-700' : 'border-neutral-300 dark:border-neutral-700'} rounded-md bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-neutral-100`}
                placeholder="Write your post content here..."
              ></textarea>
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="hashtags" className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Tag size={16} className="mr-2" />
                Hashtags (comma separated)
              </label>
              <input
                type="text"
                id="hashtags"
                {...register('hashtags')}
                className={`w-full px-4 py-2 border ${errors.hashtags ? 'border-red-300 dark:border-red-700' : 'border-neutral-300 dark:border-neutral-700'} rounded-md bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-neutral-100`}
                placeholder="javascript, react, webdev"
              />
              {errors.hashtags && (
                <p className="mt-1 text-sm text-red-500">{errors.hashtags.message}</p>
              )}
            </div>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Image (optional)
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-sm text-red-500 hover:text-red-600 flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Remove
                  </button>
                )}
              </div>
              
              {imagePreview ? (
                <div className="relative mt-2 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <label className="flex justify-center px-6 py-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                    <div className="flex flex-col items-center">
                      <Image size={36} className="text-neutral-400 mb-2" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Click to upload an image
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 mr-4 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow-sm transition-colors flex items-center"
              >
                {(isSubmitting || isUploading) && <Loader size={16} className="mr-2 animate-spin" />}
                {isSubmitting || isUploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditPostPage;