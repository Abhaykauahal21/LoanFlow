import React from 'react';
import { useParams } from 'react-router-dom';
import LoanEMIDetails from '../components/LoanEMIDetails';

const LoanEMIDetailsPage = () => {
  const { loanId } = useParams();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loan EMI Details</h1>
          <p className="mt-2 text-lg text-gray-600">
            View your loan EMI schedule and payment details
          </p>
        </div>
        
        {/* Use the loanId from URL params, fallback to mock data only if needed */}
        <LoanEMIDetails loanId={loanId || "LN123"} useMockData={false} />
      </div>
    </div>
  );
};

export default LoanEMIDetailsPage;