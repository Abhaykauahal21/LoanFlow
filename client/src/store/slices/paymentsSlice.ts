import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export interface Payment {
  _id: string;
  loanId: string;
  userId: string;
  amount: number;
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId?: string;
  remarks?: string;
}

interface PaymentsState {
  items: Payment[];
  pendingPayments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  items: [],
  pendingPayments: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async () => {
    const response = await axios.get('/admin/payments');
    return response.data;
  }
);

export const fetchUserPayments = createAsyncThunk(
  'payments/fetchUserPayments',
  async (userId: string) => {
    const response = await axios.get(`/payments/user/${userId}`);
    return response.data;
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData: Omit<Payment, '_id'>) => {
    const response = await axios.post('/payments', paymentData);
    return response.data;
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'payments/updateStatus',
  async ({ id, status, remarks }: { id: string; status: Payment['status']; remarks?: string }) => {
    const response = await axios.put(`/payments/${id}/status`, { status, remarks });
    return response.data;
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.pendingPayments = action.payload.filter(
          (payment: Payment) => payment.status === 'pending'
        );
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payments';
      })
      // Create Payment
      .addCase(createPayment.fulfilled, (state, action) => {
        state.items.push(action.payload);
        if (action.payload.status === 'pending') {
          state.pendingPayments.push(action.payload);
        }
      })
      // Update Payment Status
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(payment => payment._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.pendingPayments = state.items.filter(payment => payment.status === 'pending');
      });
  },
});

export const { resetError } = paymentsSlice.actions;
export default paymentsSlice.reducer;