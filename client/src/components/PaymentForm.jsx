import React, { useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const PaymentForm = ({ loanId, amount, onSuccess }) => {
  const [paymentAmount, setPaymentAmount] = useState(amount || '');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you would integrate with a payment processor here
      // For this demo, we'll simulate a successful payment
      await axios.post('/payments/make', {
        loanId,
        amount: parseFloat(paymentAmount),
        method: paymentMethod
      });
      
      toast.success('Payment successful!');
      setPaymentAmount('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Make a Payment</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
              step="0.01"
              min="1"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Credit Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={() => setPaymentMethod('bank')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Bank Transfer</span>
            </label>
          </div>
        </div>
        
        {paymentMethod === 'card' && (
          <>
            <div className="mb-4">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration (MM/YY)
                </label>
                <input
                  type="text"
                  id="cardExpiry"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                />
              </div>
              <div>
                <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  id="cardCvc"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="123"
                  maxLength="3"
                  required
                />
              </div>
            </div>
          </>
        )}
        
        {paymentMethod === 'bank' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Please use the following details for bank transfer:
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>Bank: National Bank</li>
              <li>Account Name: LoanFlow Inc.</li>
              <li>Account Number: 1234567890</li>
              <li>Reference: Your Loan ID</li>
            </ul>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Make Payment'
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;