import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateKycStatus } from '../store/slices/usersSlice';
import { toast } from 'react-hot-toast';

const KycVerification = ({ user }) => {
  const dispatch = useDispatch();
  const [remarks, setRemarks] = useState('');

  const handleVerification = async (status) => {
    try {
      await dispatch(updateKycStatus({ 
        id: user._id, 
        status, 
        remarks 
      })).unwrap();
      
      toast.success(`KYC ${status} successfully`);
      setRemarks('');
    } catch (err) {
      toast.error(err.message || 'Failed to update KYC status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.kycStatus)}`}>
            {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {Object.entries(user.kycDocuments || {}).map(([type, url]) => (
            url && (
              <div key={type} className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img 
                    src={url} 
                    alt={type} 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <a 
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-32 bg-gray-50 rounded-lg text-blue-600 hover:text-blue-700"
                  >
                    View Document
                  </a>
                )}
              </div>
            )
          ))}
        </div>

        {user.kycStatus === 'pending' && (
          <>
            <div className="mb-4">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                id="remarks"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any verification remarks or notes..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleVerification('verified')}
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Verify
              </button>
              <button
                onClick={() => handleVerification('rejected')}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reject
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KycVerification;