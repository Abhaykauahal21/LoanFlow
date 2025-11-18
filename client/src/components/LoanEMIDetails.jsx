import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaDownload, FaMoneyBillWave } from 'react-icons/fa';
import { generateEmiSchedule, calculateEmiAmount } from '../utils/emi';

// Generate mock data based on a sample loan amount using the utility functions
const mockLoanData = (() => {
  const loanAmount = 100000;
  const annualInterestRate = 12;
  const tenureMonths = 12;
  const today = new Date();
  
  console.log(`Generating mock data with: Amount=${loanAmount}, Rate=${annualInterestRate}%, Tenure=${tenureMonths} months`);
  
  const result = generateEmiSchedule({
    loanAmount,
    annualInterestRate,
    loanTenureMonths: tenureMonths,
    approvalDate: today
  });
  
  // Add status to each schedule item
  const scheduleWithStatus = result.schedule.map((item, index) => ({
    ...item,
    status: index === 0 ? "Paid" : "Upcoming",
    total: item.principal + item.interest
  }));
  
  return {
    loanId: "LN" + Math.floor(Math.random() * 1000),
    loanAmount,
    interestRate: annualInterestRate,
    tenureMonths,
    monthlyEmi: result.emi,
    totalInterest: result.totalInterest,
    totalPayable: result.totalPayable,
    approvalDate: today.toISOString().split('T')[0],
    schedule: scheduleWithStatus
  };
})();

const LoanEMIDetails = ({ loanId, useMockData = false }) => {
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoanEMIDetails = async () => {
      if (useMockData) {
        setLoanData(mockLoanData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // First fetch the loan details to get the loan amount, tenure and other details
        const loanResponse = await axios.get(`/loans/${loanId}`);
        const loanDetails = loanResponse.data;
        
        // Ensure we have the required loan details
        if (!loanDetails || !loanDetails.amount || loanDetails.status !== 'approved') {
          throw new Error('Loan details incomplete or loan not approved');
        }
        
        console.log('Fetched loan details:', loanDetails);
        
        // Try to fetch EMI details from API
        try {
          const emisResponse = await axios.get(`/loans/${loanId}/emis`);
          setLoanData(emisResponse.data);
          console.log('Using EMI data from API');
        } catch (emisError) {
          // If EMI details API fails, calculate EMIs based on loan amount
          console.log('EMI details API not available, calculating EMIs locally');
          
          // Use actual values from loan details with sensible defaults
          const amount = loanDetails.amount;
          const interestRate = loanDetails.interestRate || 12; // Default to 12% if not provided
          const tenureMonths = loanDetails.tenureMonths || 12;   // Default to 12 months if not provided
          
          console.log(`Using dynamic values for calculation: Amount=${amount}, Rate=${interestRate}%, Tenure=${tenureMonths} months`);
          
          // Use the utility function to calculate EMI schedule
          const result = generateEmiSchedule({
            loanAmount: amount,
            annualInterestRate: interestRate,
            loanTenureMonths: tenureMonths,
            approvalDate: loanDetails.createdAt || new Date()
          });
          
          // Add status to each schedule item
          const scheduleWithStatus = result.schedule.map((item, index) => ({
            ...item,
            status: index === 0 ? "Paid" : "Upcoming",
            total: item.principal + item.interest
          }));
          
          const calculatedData = {
            loanId: loanId,
            loanAmount: amount,
            interestRate: interestRate,
            tenureMonths: tenureMonths,
            monthlyEmi: result.emi,
            totalInterest: result.totalInterest,
            totalPayable: result.totalPayable,
            approvalDate: loanDetails.createdAt || new Date().toISOString().split('T')[0],
            schedule: scheduleWithStatus
          };
          
          setLoanData(calculatedData);
          alert(`EMI calculated successfully using approved loan amount: ₹${amount}. Monthly EMI: ₹${result.emi.toFixed(2)}`);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching loan details:', err);
        setError('Failed to load loan details. Using mock data instead.');
        setLoanData(mockLoanData); // Fallback to mock data only as last resort
      } finally {
        setLoading(false);
      }
    };

    fetchLoanEMIDetails();
  }, [loanId, useMockData]);

  const getNextEMIDueDate = () => {
    if (!loanData?.schedule) return null;
    
    const upcomingEMI = loanData.schedule.find(emi => emi.status === "Upcoming");
    return upcomingEMI ? new Date(upcomingEMI.date) : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadSchedule = () => {
    // This would be implemented with a PDF generation library
    alert('Download functionality would generate a PDF of the EMI schedule');
  };

  const handleEarlyPayment = () => {
    // This would open a payment form or modal
    alert('Early payment functionality would open a payment form');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
      </div>
    );
  }

  if (error && !loanData) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const nextEMIDate = getNextEMIDueDate();

  return (
    <div className="space-y-8">
      {/* Next EMI Due Date Banner */}
      {nextEMIDate && (
        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Next EMI Due Date</h3>
            <p className="text-blue-700">
              {nextEMIDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">Amount Due</p>
            <p className="text-xl font-bold text-blue-900">
              ${loanData.monthlyEmi.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Loan Summary Card */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Loan Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Loan Amount</p>
              <p className="text-xl font-semibold text-gray-900">${loanData.loanAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Interest Rate</p>
              <p className="text-xl font-semibold text-gray-900">{loanData.interestRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tenure</p>
              <p className="text-xl font-semibold text-gray-900">{loanData.tenureMonths} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly EMI</p>
              <p className="text-xl font-semibold text-gray-900">${loanData.monthlyEmi.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Interest</p>
              <p className="text-xl font-semibold text-gray-900">${loanData.totalInterest.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Payable</p>
              <p className="text-xl font-semibold text-gray-900">${loanData.totalPayable.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={handleDownloadSchedule}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
        >
          <FaDownload className="mr-2" />
          Download Schedule (PDF)
        </button>
        <button 
          onClick={handleEarlyPayment}
          className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
        >
          <FaMoneyBillWave className="mr-2" />
          Make Early Payment
        </button>
      </div>

      {/* EMI Schedule Table */}
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">EMI Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Principal</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Interest</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loanData.schedule.map((emi) => (
                <tr key={emi.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{emi.month}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {new Date(emi.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${emi.principal.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${emi.interest.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${emi.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${emi.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(emi.status)}`}>
                      {emi.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanEMIDetails;