import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationManager from './components/NotificationManager';
import ErrorBoundary from './components/ErrorBoundary';

import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
// Landing page removed; default route will redirect to login
import ApplyLoan from './pages/ApplyLoan';
import LoanEMIDetailsPage from './pages/LoanEMIDetailsPage';

function App() {  
  return (
    <ErrorBoundary>
      <NotificationManager />
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
  <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/apply" element={<ProtectedRoute><ApplyLoan /></ProtectedRoute>} />
        <Route path="/loan-emi/:loanId" element={<ProtectedRoute><LoanEMIDetailsPage /></ProtectedRoute>} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        
  {/* Catch All Route */}
  <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
