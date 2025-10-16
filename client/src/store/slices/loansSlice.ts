import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export interface Loan {
  _id: string;
  user: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

interface LoansState {
  items: Loan[];
  statistics: {
    totalLoans: number;
    pendingLoans: number;
    approvedLoans: number;
    rejectedLoans: number;
    totalAmount: number;
  };
  analytics: {
    trends: any[];
    approvalRates: any[];
    monthlyStats: {
      approvedAmount: number;
      distribution: any[];
    };
  };
  loading: boolean;
  error: string | null;
}

const initialState: LoansState = {
  items: [],
  statistics: {
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    totalAmount: 0,
  },
  analytics: {
    trends: [],
    approvalRates: [],
    monthlyStats: {
      approvedAmount: 0,
      distribution: [],
    },
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchLoans = createAsyncThunk(
  'loans/fetchLoans',
  async ({ status, search }: { status?: string; search?: string }) => {
    const query = `${status ? `?status=${status}` : ''}${search ? `&search=${search}` : ''}`;
    const response = await axios.get(`/admin/loans${query}`);
    return response.data;
  }
);

export const fetchLoanStats = createAsyncThunk(
  'loans/fetchStats',
  async () => {
    const response = await axios.get('/admin/stats');
    return response.data;
  }
);

export const fetchLoanAnalytics = createAsyncThunk(
  'loans/fetchAnalytics',
  async () => {
    const response = await axios.get('/admin/analytics');
    return response.data;
  }
);

export const updateLoanStatus = createAsyncThunk(
  'loans/updateStatus',
  async ({ id, status, adminNote }: { id: string; status: string; adminNote?: string }) => {
    const response = await axios.put(`/admin/loans/${id}/status`, { status, adminNote });
    return response.data;
  }
);

const loansSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Loans
      .addCase(fetchLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch loans';
      })
      // Fetch Stats
      .addCase(fetchLoanStats.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })
      // Fetch Analytics
      .addCase(fetchLoanAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      // Update Status
      .addCase(updateLoanStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(loan => loan._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { resetError } = loansSlice.actions;
export default loansSlice.reducer;