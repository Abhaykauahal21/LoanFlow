import React from 'react';
import axios from '../api/axios';

const LoanCard = ({ loan, isAdmin, onStatusUpdate }) => {
  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Under Review': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800'
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`/admin/loans/${loan._id}/status`, { status: newStatus });
      onStatusUpdate(loan._id, newStatus);
    } catch (error) {
      console.error('Error updating loan status:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Loan Amount: ${loan.amount.toLocaleString()}</h3>
          <p className="text-gray-600">Tenure: {loan.tenureMonths} months</p>
          <p className="text-gray-600">Income: ${loan.income.toLocaleString()}/year</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[loan.status]}`}>
          {loan.status}
        </span>
      </div>
      
      {loan.documents?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Documents:</h4>
          <div className="flex flex-wrap gap-2">
            {loan.documents.map((doc, index) => (
              <a
                key={index}
                href={`http://localhost:5000/${doc}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Document {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {loan.adminNote && (
        <div className="mt-2 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700"><span className="font-medium">Admin Note:</span> {loan.adminNote}</p>
        </div>
      )}

      {isAdmin && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => handleStatusChange('Under Review')}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Mark Under Review
          </button>
          <button
            onClick={() => handleStatusChange('Approved')}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => handleStatusChange('Rejected')}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default LoanCard;
