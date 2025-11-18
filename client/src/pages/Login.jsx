import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const validateForm = useCallback(() => {
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  }, [formData.email, formData.password]);

  const attemptLoginWithRetry = useCallback(async () => {
    const maxRetries = 1; // one retry on transient failures
    let attempt = 0;
    let lastError;
    while (attempt <= maxRetries) {
      try {
        const user = await login(formData.email, formData.password, formData.role);
        return user;
      } catch (err) {
        lastError = err;
        // Retry only for network or 5xx errors
        const status = err?.response?.status;
        const isTransient = !status || (status >= 500 && status < 600);
        if (!isTransient || attempt === maxRetries) throw err;
        // Exponential backoff: 300ms, then 600ms
        const delay = 300 * (attempt + 1);
        await new Promise((res) => setTimeout(res, delay));
        attempt += 1;
      }
    }
    throw lastError;
  }, [login, formData.email, formData.password, formData.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setIsLoading(true);
    
    try {
      const user = await attemptLoginWithRetry();
      toast.success('Logged in successfully');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const apiMsg = err?.response?.data?.msg || err?.response?.data?.message;
      const message = apiMsg || err?.message || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Subtle mouse move effect
  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    let rafId = null;
    let lastEvent = null;

    const animate = () => {
      if (!lastEvent) return;
      const e = lastEvent;
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 3}deg) rotateX(${y * -3}deg)`;
      rafId = null;
    };

    const handleMouseMove = (e) => {
      lastEvent = e;
      if (rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    };

    container.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
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
                    Streamline Your<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      Loan Operations
                    </span>
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-600">
                    Manage loan applications, track repayments, and monitor portfolio performance 
                    with our comprehensive loan management platform.
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
                    <span className="font-medium text-gray-700">Automated loan processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center w-6 h-6 bg-green-100 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Real-time repayment tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center w-6 h-6 bg-green-100 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Comprehensive risk assessment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center w-6 h-6 bg-green-100 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">Regulatory compliance monitoring</span>
                  </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1.2K+</div>
                    <div className="text-xs font-medium text-gray-600">Active Loans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">$48M</div>
                    <div className="text-xs font-medium text-gray-600">Portfolio Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">99.1%</div>
                    <div className="text-xs font-medium text-gray-600">On-time Payments</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Professional Login Form */}
          <div className="w-full lg:w-1/2">
            <div className="mx-auto max-w-md">
              {/* Login Card */}
              <div 
                ref={cardRef}
                className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-xl transition-all duration-500 ease-out"
              >
                <div className="p-8">
                  <div className="mb-8 text-center">
                    <h2 className="mb-3 text-2xl font-bold text-gray-900">
                      Access Loan Portal
                    </h2>
                    <p className="text-gray-600">
                      Sign in to manage your loan portfolio
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
                            placeholder="Enter your password"
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
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="remember-me" className="block ml-2 text-sm font-medium text-gray-700">
                          Remember this device
                        </label>
                      </div>

                      <div className="text-sm">
                        <a href="#" className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500">
                          Forgot password?
                        </a>
                      </div>
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
                          Signing in...
                        </>
                      ) : (
                        'Access Loan Dashboard'
                      )}
                    </button>
                  </form>

                  <div className="pt-6 mt-8 text-center border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Need access to the system?{' '}
                      <Link to="/register" className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-500">
                        Request account
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
                      <span>Bank-level Security</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Security Notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our{' '}
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

export default Login;