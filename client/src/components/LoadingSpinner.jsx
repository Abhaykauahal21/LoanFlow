import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = ({ size = 40, color = '#3b82f6' }) => (
  <div className="flex items-center justify-center p-4">
    <ClipLoader size={size} color={color} />
  </div>
);

export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
      <ClipLoader size={40} color="#3b82f6" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

export const LoadingCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

export default LoadingSpinner;