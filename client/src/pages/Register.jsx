// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'user'
//   });
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const { register, user, error: authError, clearError } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     setMounted(true);
//     // Clear any previous auth errors when component mounts
//     clearError();
    
//     // Redirect if user is already logged in
//     if (user) {
//       navigate(user.role === 'admin' ? '/admin' : '/dashboard');
//     }
//     return () => setMounted(false);
//   }, [user, navigate, clearError]);

//   // Update local error state when auth error changes
//   useEffect(() => {
//     if (authError) {
//       setError(authError);
//       setIsLoading(false);
//     }
//   }, [authError]);

//   const handleChange = (e) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//     // Clear errors when user starts typing
//     setError('');
//   };

//   const validateForm = () => {
//     if (!formData.name.trim()) {
//       setError('Name is required');
//       return false;
//     }
//     if (!formData.email.trim()) {
//       setError('Email is required');
//       return false;
//     }
//     if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       setError('Please enter a valid email address');
//       return false;
//     }
//     if (!formData.password) {
//       setError('Password is required');
//       return false;
//     }
//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters long');
//       return false;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     if (!validateForm()) {
//       return;
//     }

//     try {
//       setIsLoading(true);
//       await register(
//         formData.name,
//         formData.email,
//         formData.password,
//         formData.role
//       );
      
//       // Registration is handled by AuthContext's useEffect for navigation
//     } catch (err) {
//       setError(err.message || 'Registration failed. Please try again.');
//       console.error('Registration error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!mounted) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50">
//         <div className="w-12 h-12 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen">
//       {/* Left Side - Branding & Graphics */}
//       <div className="hidden text-white bg-gradient-to-br from-blue-900 to-purple-800 lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:px-20 lg:py-12">
//         <div className="flex items-center space-x-3">
//           <div className="flex justify-center items-center w-10 h-10 bg-white rounded-lg">
//             <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//             </svg>
//           </div>
//           <span className="text-xl font-bold">LoanFlow</span>
//         </div>
        
//         <div className="max-w-md">
//           <h1 className="mb-6 text-4xl font-bold">Start Your Journey</h1>
//           <p className="text-lg leading-relaxed text-blue-200">
//             Join thousands of financial professionals managing loans efficiently. 
//             Get access to powerful tools for loan processing, tracking, and analytics.
//           </p>
//         </div>
        
//         <div className="space-y-6">
//           <div className="flex items-center p-4 space-x-4 rounded-xl backdrop-blur-sm bg-white/10">
//             <div className="flex justify-center items-center w-12 h-12 bg-green-500 rounded-lg">
//               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <div className="font-semibold">Real-time Analytics</div>
//               <div className="text-sm text-blue-200">Monitor loan performance instantly</div>
//             </div>
//           </div>
          
//           <div className="flex items-center p-4 space-x-4 rounded-xl backdrop-blur-sm bg-white/10">
//             <div className="flex justify-center items-center w-12 h-12 bg-purple-500 rounded-lg">
//               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//               </svg>
//             </div>
//             <div>
//               <div className="font-semibold">Bank-level Security</div>
//               <div className="text-sm text-blue-200">Your data is encrypted and protected</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Side - Registration Form */}
//       <div className="flex flex-col flex-1 justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
//         <div className="mx-auto w-full max-w-md">
//           {/* Mobile Logo */}
//           <div className="flex justify-center mb-8 lg:hidden">
//             <div className="flex items-center space-x-3">
//               <div className="flex justify-center items-center w-10 h-10 bg-blue-600 rounded-lg">
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//                 </svg>
//               </div>
//               <span className="text-xl font-bold text-gray-900">LoanFlow</span>
//             </div>
//           </div>

//           <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-xl">
//             <div className="mb-8 text-center">
//               <h2 className="text-3xl font-bold text-gray-900">
//                 Create Account
//               </h2>
//               <p className="mt-2 text-gray-600">
//                 Join LoanFlow and streamline your loan management
//               </p>
//             </div>
            
//             {error && (
//               <div className="flex items-start p-4 mb-6 space-x-3 bg-red-50 rounded-xl border border-red-200">
//                 <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//                 <span className="text-sm text-red-700">{error}</span>
//               </div>
//             )}

//             <form className="space-y-6" onSubmit={handleSubmit}>
//               <div className="space-y-4">
//                 <div>
//                   <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
//                     Full Name
//                   </label>
//                   <div className="relative">
//                     <input
//                       id="name"
//                       name="name"
//                       type="text"
//                       required
//                       className="block px-4 py-3 w-full placeholder-gray-400 bg-gray-50 rounded-xl border border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
//                       placeholder="Enter your full name"
//                       value={formData.name}
//                       onChange={handleChange}
//                     />
//                     <div className="flex absolute inset-y-0 right-0 items-center pr-3">
//                       <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div>
//                   <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
//                     Email Address
//                   </label>
//                   <div className="relative">
//                     <input
//                       id="email"
//                       name="email"
//                       type="email"
//                       required
//                       className="block px-4 py-3 w-full placeholder-gray-400 bg-gray-50 rounded-xl border border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
//                       placeholder="Enter your email"
//                       value={formData.email}
//                       onChange={handleChange}
//                     />
//                     <div className="flex absolute inset-y-0 right-0 items-center pr-3">
//                       <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                         <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-700">
//                     Account Type
//                   </label>
//                   <select
//                     id="role"
//                     name="role"
//                     value={formData.role}
//                     onChange={handleChange}
//                     className="block px-4 py-3 w-full bg-gray-50 rounded-xl border border-gray-300 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="user">Regular User</option>
//                     <option value="admin">Administrator</option>
//                   </select>
//                 </div>
                
//                 <div>
//                   <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
//                     Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       id="password"
//                       name="password"
//                       type="password"
//                       required
//                       className="block px-4 py-3 w-full placeholder-gray-400 bg-gray-50 rounded-xl border border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
//                       placeholder="Create a password"
//                       value={formData.password}
//                       onChange={handleChange}
//                     />
//                     <div className="flex absolute inset-y-0 right-0 items-center pr-3">
//                       <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                   </div>
//                   <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
//                 </div>
                
//                 <div>
//                   <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
//                     Confirm Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       id="confirmPassword"
//                       name="confirmPassword"
//                       type="password"
//                       required
//                       className="block px-4 py-3 w-full placeholder-gray-400 bg-gray-50 rounded-xl border border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
//                       placeholder="Confirm your password"
//                       value={formData.confirmPassword}
//                       onChange={handleChange}
//                     />
//                     <div className="flex absolute inset-y-0 right-0 items-center pr-3">
//                       <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center">
//                 <input
//                   id="terms"
//                   name="terms"
//                   type="checkbox"
//                   required
//                   className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                 />
//                 <label htmlFor="terms" className="block ml-2 text-sm text-gray-700">
//                   I agree to the{' '}
//                   <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
//                     Terms of Service
//                   </a>{' '}
//                   and{' '}
//                   <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
//                     Privacy Policy
//                   </a>
//                 </label>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
//                   isLoading ? 'opacity-70 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'
//                 }`}
//               >
//                 {isLoading ? (
//                   <>
//                     <svg className="mr-3 -ml-1 w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Creating Account...
//                   </>
//                 ) : (
//                   'Create Account'
//                 )}
//               </button>
//             </form>

//             <div className="mt-8 text-center">
//               <p className="text-gray-600">
//                 Already have an account?{' '}
//                 <Link to="/login" className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500">
//                   Sign in here
//                 </Link>
//               </p>
//             </div>
//           </div>

//           {/* Security Notice */}
//           <div className="mt-8 text-center">
//             <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
//               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//               </svg>
//               <span>256-bit SSL encryption • GDPR compliant</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const { register, user, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Clear any previous auth errors when component mounts
    clearError();
    
    // Redirect if user is already logged in
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate, clearError]);

  // Update local error state when auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear errors when user starts typing
    setError('');
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      
      // Registration is handled by AuthContext's useEffect for navigation
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Subtle mouse move effect
  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      card.style.transform = `
        perspective(1000px) 
        rotateY(${x * 3}deg) 
        rotateX(${y * -3}deg)
      `;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    };

    container.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex overflow-hidden relative justify-center items-center p-4 min-h-screen bg-gradient-to-br via-blue-50 to-indigo-50 from-slate-50"
    >
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(30deg,#0f172a12_12%,transparent_12.5%,transparent_87%,#0f172a12_87.5%,#0f172a12),linear-gradient(150deg,#0f172a12_12%,transparent_12.5%,transparent_87%,#0f172a12_87.5%,#0f172a12)] bg-[size:60px_60px]"></div>
      </div>

      {/* Subtle Accent Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      
      <div className="absolute -left-20 top-1/4 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>
      <div className="absolute -right-20 bottom-1/4 w-40 h-40 bg-indigo-100 rounded-full opacity-50"></div>

      <div className="z-10 w-full max-w-6xl">
        <div className="flex flex-col justify-between items-center lg:flex-row">
          {/* Left Side - Professional Branding */}
          <div className="mb-12 w-full lg:w-1/2 lg:mb-0 lg:pr-12">
            <div className="mx-auto max-w-md lg:mx-0">
              {/* Logo */}
              <div className="flex items-center mb-12 space-x-4">
                <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">LoanFlow</h1>
                  <div className="text-sm font-medium text-gray-600">Loan Management System</div>
                </div>
              </div>

              {/* Value Proposition */}
              <div className="space-y-8">
                <div>
                  <h2 className="mb-6 text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
                    Start Your Journey<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      With LoanFlow
                    </span>
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-600">
                    Join thousands of financial professionals managing loans efficiently. 
                    Get access to powerful tools for loan processing, tracking, and analytics.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center w-6 h-6 bg-green-100 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Real-time Analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center w-6 h-6 bg-green-100 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Bank-level Security</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center w-6 h-6 bg-green-100 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Automated Processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center w-6 h-6 bg-green-100 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Compliance Monitoring</span>
                  </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">500+</div>
                    <div className="text-xs font-medium text-gray-600">Institutions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">99.9%</div>
                    <div className="text-xs font-medium text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">24/7</div>
                    <div className="text-xs font-medium text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Professional Registration Form */}
          <div className="w-full lg:w-1/2">
            <div className="mx-auto max-w-md">
              {/* Registration Card */}
              <div 
                ref={cardRef}
                className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-xl transition-all duration-500 ease-out"
              >
                <div className="p-8">
                  <div className="mb-8 text-center">
                    <h2 className="mb-3 text-2xl font-bold text-gray-900">
                      Create Account
                    </h2>
                    <p className="text-gray-600">
                      Join LoanFlow and streamline your loan management
                    </p>
                  </div>
                  
                  {error && (
                    <div className="flex items-start p-4 mb-6 space-x-3 bg-red-50 rounded-xl border border-red-200">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                      {/* Name Input */}
                      <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700">
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className={`w-full px-4 py-3 rounded-xl border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isFocused.name 
                                ? 'border-blue-500 shadow-sm' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={() => handleFocus('name')}
                            onBlur={() => handleBlur('name')}
                          />
                          <div className="flex absolute inset-y-0 right-0 items-center pr-3">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Email Input */}
                      <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className={`w-full px-4 py-3 rounded-xl border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isFocused.email 
                                ? 'border-blue-500 shadow-sm' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder="Enter your work email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={() => handleFocus('email')}
                            onBlur={() => handleBlur('email')}
                          />
                          <div className="flex absolute inset-y-0 right-0 items-center pr-3">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Role Selection */}
                      <div>
                        <label htmlFor="role" className="block mb-2 text-sm font-semibold text-gray-700">
                          Account Type
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="px-4 py-3 w-full bg-white rounded-xl border border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="user">Regular User</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                      
                      {/* Password Input */}
                      <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className={`w-full px-4 py-3 rounded-xl border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isFocused.password 
                                ? 'border-blue-500 shadow-sm' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => handleFocus('password')}
                            onBlur={() => handleBlur('password')}
                          />
                          <div className="flex absolute inset-y-0 right-0 items-center pr-3">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Must be at least 6 characters long</p>
                      </div>
                      
                      {/* Confirm Password Input */}
                      <div>
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-semibold text-gray-700">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className={`w-full px-4 py-3 rounded-xl border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isFocused.confirmPassword 
                                ? 'border-blue-500 shadow-sm' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onFocus={() => handleFocus('confirmPassword')}
                            onBlur={() => handleBlur('confirmPassword')}
                          />
                          <div className="flex absolute inset-y-0 right-0 items-center pr-3">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="terms" className="block ml-2 text-sm font-medium text-gray-700">
                        I agree to the{' '}
                        <a href="#" className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-500">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-500">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : 'shadow-lg transform hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="mr-3 -ml-1 w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </form>

                  <div className="pt-6 mt-8 text-center border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link to="/login" className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-500">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Security Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-center items-center space-x-6 text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Secure Connection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>256-bit SSL</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Security Notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-gray-600 underline hover:text-gray-800">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-gray-600 underline hover:text-gray-800">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;