import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = ({ size = 40, color = '#1e3a8a' }) => (
  <div className="flex flex-col justify-center items-center p-6">
    <div className="relative">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping"></div>
      <ClipLoader size={size} color={color} />
    </div>
    <p className="mt-3 text-sm font-medium tracking-wide text-gray-600">
      Processing your request...
    </p>
  </div>
);

export const LoadingOverlay = ({ message = 'Processing your transaction...' }) => (
  <div className="flex fixed inset-0 z-50 justify-center items-center bg-gradient-to-br backdrop-blur-sm from-blue-900/80 to-blue-600/60">
    <div className="flex flex-col items-center p-8 w-72 rounded-2xl shadow-xl bg-white/90">
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
        <ClipLoader size={50} color="#1e3a8a" />
      </div>
      <p className="mt-4 font-semibold text-center text-gray-700">{message}</p>
      <p className="mt-1 text-xs text-gray-500">Secure banking in progress 🔒</p>
    </div>
  </div>
);

export const LoadingCard = () => (
  <div className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 shadow-md animate-pulse">
    <div className="mb-4 w-1/4 h-4 bg-blue-100 rounded"></div>
    <div className="mb-6 w-1/2 h-8 bg-blue-200 rounded"></div>
    <div className="space-y-3">
      <div className="h-3 bg-blue-100 rounded"></div>
      <div className="w-5/6 h-3 bg-blue-100 rounded"></div>
      <div className="w-4/6 h-3 bg-blue-100 rounded"></div>
    </div>
  </div>
);

export default LoadingSpinner;
