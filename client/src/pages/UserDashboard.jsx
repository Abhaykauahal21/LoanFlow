import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoanCard from '../components/LoanCard';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FaFileUpload, FaMoneyBillWave, FaChartLine, FaFileInvoiceDollar } from 'react-icons/fa';

// Lazy load components that aren't needed immediately
const PaymentForm = lazy(() => import('../components/PaymentForm'));
const AnalyticsChart = lazy(() => import('../components/AnalyticsChart'));

const PieChart = ({ loans }) => {
  const total = loans?.total || 0;
  const approved = loans?.approved || 0;
  const pending = loans?.pending || 0;
  const rejected = loans?.rejected || 0;

  // Ensure we have data before calculating percentages
  const hasData = total > 0;

  const calculatePercent = (value) => ((value / total) * 100).toFixed(1);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-4">Loan Status Distribution</h3>
      {total > 0 ? (
        <>
          <div className="h-40 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                {/* Approved */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray={`${(approved/total) * 314} 314`}
                />
                {/* Pending */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="12"
                  strokeDasharray={`${(pending/total) * 314} 314`}
                  strokeDashoffset={`${-((approved/total) * 314)}`}
                />
                {/* Rejected */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="12"
                  strokeDasharray={`${(rejected/total) * 314} 314`}
                  strokeDashoffset={`${-(((approved + pending)/total) * 314)}`}
                />
              </svg>
            </div>
            <div className="text-center z-10">
              <p className="text-lg font-semibold text-gray-700">{total}</p>
              <p className="text-xs text-gray-500">Total Loans</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">
                Approved ({calculatePercent(approved)}%)
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">
                Pending ({calculatePercent(pending)}%)
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">
                Rejected ({calculatePercent(rejected)}%)
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">Total: {total}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm">No loan data available</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color = 'blue', isCurrency = false }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  const formattedValue = isCurrency 
    ? `$${Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}` 
    : value;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formattedValue}</p>
          {change !== undefined && (
            <p className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} bg-gradient-to-br ${color === 'blue' ? 'from-blue-500 to-blue-600' : color === 'green' ? 'from-green-500 to-green-600' : color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-orange-500 to-orange-600'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}


const UserDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    totalBorrowed: 0,
    pendingApplications: 0
  });
  const { user, logout } = useAuth();

  // Function to fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user || !user._id) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Using the imported axios instance with the correct base URL
      const [loansRes, statsRes, paymentsRes] = await Promise.all([
        axios.get('/loans/my').catch(err => {
          console.error('Failed to fetch loans:', err);
          return { data: [] };
        }),
        axios.get('/loans/dashboard-stats').catch(err => {
          console.error('Failed to fetch dashboard stats:', err);
          return { data: null };
        }),
        axios.get(`/payments/user/${user._id}`).catch(err => {
          console.error('Failed to fetch payments:', err);
          return { data: [] };
        })
      ]);

      const loansData = loansRes.data;
      const statsData = statsRes.data;
      const paymentsData = paymentsRes.data;

      setLoans(loansData || []);
      setPayments(paymentsData || []);

      if (statsData) {
        const { loans = {}, amounts = {} } = statsData;
        
        setStats({
          totalLoans: loans.total || 0,
          activeLoans: loans.approved || 0,
          totalBorrowed: amounts.total || 0,
          pendingApplications: loans.pending || 0
        });
        
        setDashboardData({
          loans,
          amounts,
          monthlyStats: statsData.monthlyStats || []
        });
      } else {
        // Fallback calculations if API fails
        const calculatedStats = {
          totalLoans: loansData.length,
          activeLoans: loansData.filter(loan => loan.status === 'Approved').length,
          totalBorrowed: loansData.filter(loan => loan.status === 'Approved')
            .reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0),
          pendingApplications: loansData.filter(loan => loan.status === 'Pending').length,
          rejectedLoans: loansData.filter(loan => loan.status === 'Rejected').length
        };
        
        setStats(calculatedStats);
        setDashboardData({
          loans: {
            total: calculatedStats.totalLoans,
            approved: calculatedStats.activeLoans,
            pending: calculatedStats.pendingApplications,
            rejected: calculatedStats.rejectedLoans
          },
          amounts: {
            total: calculatedStats.totalBorrowed,
            average: calculatedStats.totalLoans > 0 ? calculatedStats.totalBorrowed / calculatedStats.activeLoans : 0
          },
          monthlyStats: []
        });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.msg || 'Failed to fetch dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Effect to fetch data on component mount and when user changes
  useEffect(() => {
    if (user && user._id) {
      fetchDashboardData();
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchDashboardData]); // Include fetchDashboardData in dependency array

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Global Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-700">Loading your dashboard...</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">LoanFlow</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">User Account</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                aria-label="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Here's your loan portfolio overview and recent activity.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              to="/apply"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-700 hover:to-purple-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Apply for New Loan
            </Link>
            <button className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Statement
            </button>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Make Payment
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Loans"
            value={stats.totalLoans}
            subtitle={`${dashboardData?.loans?.approved || 0} approved`}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Active Loans"
            value={stats.activeLoans}
            subtitle="Currently approved"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="Total Borrowed"
            value={stats.totalBorrowed}
            subtitle={`Avg: $${Math.round(dashboardData?.amounts?.average || 0).toLocaleString()}`}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            color="purple"
            isCurrency={true}
          />
          <StatCard
            title="Pending Applications"
            value={stats.pendingApplications}
            subtitle="Awaiting approval"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="orange"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <AnalyticsChart data={dashboardData} />
          </div>
          <div>
            <PieChart loans={dashboardData?.loans} />
          </div>
        </div>

        {/* Recent Loans Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Loan Applications</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {loans.length} total
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {loans.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No loans yet</h3>
                <p className="text-gray-500 mb-4">Get started by applying for your first loan</p>
                <Link
                  to="/apply"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  Apply for Loan
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <LoanCard
                    key={loan._id}
                    loan={loan}
                    isAdmin={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KYC Documents Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">KYC Documents</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ID Proof Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <input
                  type="file"
                  id="idProof"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      try {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('type', 'idProof');
                        
                        toast.loading('Uploading ID Proof...');
                        
                        try {
                          const response = await axios.post(`/users/${user._id}/kyc`, formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data'
                            }
                          });
                          
                          toast.dismiss();
                          if (response.status === 200 || response.status === 201) {
                            toast.success('ID Proof uploaded successfully');
                            // Refresh dashboard data to show updated KYC status
                            fetchDashboardData();
                          } else {
                            toast.error('Failed to upload ID Proof');
                          }
                        } catch (error) {
                          toast.dismiss();
                          console.error('Error uploading ID Proof:', error);
                          toast.error(error.response?.data?.message || 'Failed to upload ID Proof');
                        }
                        
                        // Reset the file input
                        e.target.value = '';
                      } catch (err) {
                        toast.error(err.response?.data?.msg || 'Failed to upload document');
                        console.error('Upload error:', err);
                      }
                    }
                  }}
                />
                <label
                  htmlFor="idProof"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="font-medium text-gray-900 mb-1">ID Proof</h3>
                  <p className="text-sm text-gray-500">Upload your government ID</p>
                </label>
              </div>

              {/* Address Proof Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <input
                  type="file"
                  id="addressProof"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      try {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('type', 'addressProof');
                        
                        toast.loading('Uploading Address Proof...');
                        
                        try {
                          const response = await axios.post(`/users/${user._id}/kyc`, formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data'
                            }
                          });
                          
                          toast.dismiss();
                          if (response.status === 200 || response.status === 201) {
                            toast.success('Address Proof uploaded successfully');
                            // Refresh dashboard data to show updated KYC status
                            fetchDashboardData();
                          } else {
                            toast.error('Failed to upload Address Proof');
                          }
                        } catch (error) {
                          toast.dismiss();
                          console.error('Error uploading Address Proof:', error);
                          toast.error(error.response?.data?.message || 'Failed to upload Address Proof');
                        }
                        
                        // Reset the file input
                        e.target.value = '';
                      } catch (err) {
                        toast.error(err.response?.data?.msg || 'Failed to upload document');
                        console.error('Upload error:', err);
                      }
                    }
                  }}
                />
                <label
                  htmlFor="addressProof"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="font-medium text-gray-900 mb-1">Address Proof</h3>
                  <p className="text-sm text-gray-500">Upload utility bill or rental agreement</p>
                </label>
              </div>

              {/* Income Proof Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <input
                  type="file"
                  id="incomeProof"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      try {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('type', 'incomeProof');
                        
                        toast.loading('Uploading Income Proof...');
                        
                        try {
                          const response = await axios.post(`/users/${user._id}/kyc`, formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data'
                            }
                          });
                          
                          toast.dismiss();
                          if (response.status === 200 || response.status === 201) {
                            toast.success('Income Proof uploaded successfully');
                            // Refresh dashboard data to show updated KYC status
                            fetchDashboardData();
                          } else {
                            toast.error('Failed to upload Income Proof');
                          }
                        } catch (error) {
                          toast.dismiss();
                          console.error('Error uploading Income Proof:', error);
                          toast.error(error.response?.data?.message || 'Failed to upload Income Proof');
                        }
                        
                        // Reset the file input
                        e.target.value = '';
                      } catch (err) {
                        toast.error(err.response?.data?.msg || 'Failed to upload document');
                        console.error('Upload error:', err);
                      }
                    }
                  }}
                />
                <label
                  htmlFor="incomeProof"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="font-medium text-gray-900 mb-1">Income Proof</h3>
                  <p className="text-sm text-gray-500">Upload salary slips or tax returns</p>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {user.paymentHistory?.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.loanId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!user.paymentHistory || user.paymentHistory.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No payment history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tip</h3>
            <p className="text-blue-800 text-sm">
              Make timely payments to improve your credit score and get better interest rates on future loans.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">📊 Did You Know?</h3>
            <p className="text-green-800 text-sm">
              You can save up to 15% on interest by choosing a shorter loan tenure.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">🔔 Reminder</h3>
            <p className="text-purple-800 text-sm">
              Next payment due in 7 days. Consider setting up auto-pay for convenience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;