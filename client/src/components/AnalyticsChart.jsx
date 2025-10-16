import React from 'react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const AnalyticsChart = ({ data }) => {
  // Handle null or undefined data
  if (!data || !data.monthlyStats || !Array.isArray(data.monthlyStats)) {
    return (
      <div className="flex justify-center items-center p-6 h-64 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.monthlyStats.map(item => ({
    name: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
    amount: item.amount,
    count: item.count
  }));

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Loan Activity</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="amount"
              name="Loan Amount ($)"
              stroke="#3b82f6"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="count"
              name="Number of Loans"
              stroke="#8b5cf6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;