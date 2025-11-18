import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showNotification } from '../store/slices/notificationsSlice';

const LoanCard = ({ loan, isAdmin, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const dispatch = useDispatch();

  const handleViewDocument = (doc) => {
    window.open(doc.url || `/uploads/${doc}`, '_blank');
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'rejected' && !showNoteInput) {
      setShowNoteInput(true);
      return;
    }

    setLoading(true);
    try {
      await onStatusUpdate(loan._id, newStatus, adminNote);
      setShowNoteInput(false);
      setAdminNote('');
      dispatch(
        showNotification({
          type: 'success',
          message: `Loan status updated to ${formatStatus(newStatus)}`,
        })
      );
    } catch (error) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Error updating loan status',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Loan Amount: ${loan.amount.toLocaleString()}
          </h3>
          <p className="text-gray-600">Purpose: {loan.purpose}</p>
          <p className="text-gray-600">
            Applied: {new Date(loan.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[loan.status]
          }`}
        >
          {formatStatus(loan.status)}
        </span>
      </div>
      
      {loan.status === 'approved' && (
        <div className="mt-2 mb-4">
          <a 
            href={`/loan-emi/${loan._id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 -ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View EMI Schedule
          </a>
        </div>
      )}

      {loan.documents?.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Documents:</h4>
          <div className="flex flex-wrap gap-2">
            {loan.documents.map((doc, index) => (
              <button
                key={index}
                onClick={() => handleViewDocument(doc)}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-lg transition-colors duration-200 hover:bg-gray-200"
              >
                <svg
                  className="mr-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Document {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {loan.adminNote && (
        <div className="p-3 mb-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Admin Note:</span> {loan.adminNote}
          </p>
        </div>
      )}

      {isAdmin && loan.status === 'pending' && (
        <div className="mt-4">
          {showNoteInput && (
            <div className="mb-4">
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note (required for rejection)"
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg transition-colors duration-200 hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={loading || (showNoteInput && !adminNote.trim())}
              className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => handleStatusChange('under_review')}
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50"
            >
              Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanCard;
