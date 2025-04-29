import React from 'react';
// import { motion } from 'framer-motion';
import '../../Css/Loader.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  // size = 'medium', 
  // color = 'primary',
  className = ''
}) => {
  // const sizeMap = {
  //   small: 'w-5 h-5',
  //   medium: 'w-8 h-8',
  //   large: 'w-12 h-12'
  // };

  // const colorMap = {
  //   'primary': 'border-primary-500',
  //   'secondary': 'border-secondary-500',
  //   'accent': 'border-accent-500',
  //   'white': 'border-white',
  // };

  // const spinnerSize = sizeMap[size];
  // const spinnerColor = color in colorMap ? colorMap[color as keyof typeof colorMap] : 'border-primary-500';

  return (
    <div className={`flex justify-center items-center ${className}`}>
     {/* <Loader type="ball-zig-zag" /> */}
     {/* <span c></span> */}
     <span className="loader"></span>
    </div>
  );
};

export default LoadingSpinner;