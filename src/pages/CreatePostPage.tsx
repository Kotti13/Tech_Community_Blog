import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { ArrowLeft, Image, X, Tag, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

interface CreatePostFormData {
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

const CreatePostPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CreatePostFormData>({
    resolver: yupResolver(schema)
  });
  
 

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
      try {
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'Techworld'); // Add your Cloudinary upload preset
        formData.append('cloud_name', 'db2o2ynbl'); // Add your Cloudinary cloud name
  
        const response = await axios.post('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', formData);
  
        // Get image URL from Cloudinary
        const imageUrl = response.data.secure_url;
  
        // Now image URL is ready to be stored in Firestore when creating the post
        setImagePreview(imageUrl); // Use this for preview
      } catch (err) {
        console.error('Error uploading image to Cloudinary:', err);
        setError('Failed to upload image. Please try again.');
      }
    }
  };
  
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  
  const onSubmit = async (data: CreatePostFormData) => {
    if (!user) {
      navigate('/login');
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
  
      let imageUrl = null;
  
      // Use Cloudinary image URL if available
      if (imagePreview) {
        imageUrl = imagePreview; // Cloudinary URL
      }
  
      // Create post document
      const postId = uuidv4();
      const postRef = doc(db, 'posts', postId);
  
      await setDoc(postRef, {
        title: data.title,
        content: data.content,
        imageUrl, // Cloudinary image URL
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hashtags: hashtagsArray,
        likes: [],
        bookmarkedBy: [],
        comments: [],
      });
  
      // Navigate to the new post
      navigate(`/post/${postId}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
      setIsUploading(false);
    }
  };
  
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
          
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Create Post</h1>
          
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
                {isSubmitting || isUploading ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePostPage;