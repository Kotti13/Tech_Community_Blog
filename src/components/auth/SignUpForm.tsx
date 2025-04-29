import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

const SignUpForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(schema),
  });
  
  const onSubmit = async (data: SignUpFormData) => {
    try {
      setError(null);
      await signUp(data.email, data.password, data.name);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please enable popups for this site in your browser settings and try again.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-neutral-100 mb-6">Create an Account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md text-red-500 dark:text-red-400 flex items-start">
          <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-neutral-400" />
            </div>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`w-full pl-10 pr-4 py-2 border ${errors.name ? 'border-red-300 dark:border-red-700' : 'border-neutral-300 dark:border-neutral-700'} rounded-md bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-neutral-100`}
              placeholder="Username"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-neutral-400" />
            </div>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`w-full pl-10 pr-4 py-2 border ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-neutral-300 dark:border-neutral-700'} rounded-md bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-neutral-100`}
              placeholder="Enter Your Email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-neutral-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              {...register('password')}
              className={`w-full pl-10 pr-12 py-2 border ${errors.password ? 'border-red-300 dark:border-red-700' : 'border-neutral-300 dark:border-neutral-700'} rounded-md bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-neutral-100`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} className="text-neutral-400 hover:text-neutral-500" />
              ) : (
                <Eye size={18} className="text-neutral-400 hover:text-neutral-500" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-neutral-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              {...register('confirmPassword')}
              className={`w-full pl-10 pr-12 py-2 border ${errors.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-neutral-300 dark:border-neutral-700'} rounded-md bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-neutral-100`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} className="text-neutral-400 hover:text-neutral-500" />
              ) : (
                <Eye size={18} className="text-neutral-400 hover:text-neutral-500" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow-sm transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Or sign up with
        </p>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="mt-2 w-full flex items-center justify-center py-2 px-4 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.708-6.735-2.708-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.118z"
            />
          </svg>
          Sign up with Google
        </button>
      </div>
      
      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-500 hover:text-primary-600">
          Log in
        </Link>
      </p>
    </motion.div>
  );
};

export default SignUpForm;