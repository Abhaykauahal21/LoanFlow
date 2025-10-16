import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  status: 'active' | 'suspended' | 'pending';
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycDocuments: {
    idProof?: string;
    addressProof?: string;
    incomeProof?: string;
  };
  permissions: string[];
  activeLoans: number;
  totalLoanAmount: number;
  paymentHistory: {
    loanId: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }[];
  createdAt: string;
  lastLogin: string;
}

interface UsersState {
  items: User[];
  activeUsers: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  activeUsers: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await axios.get('/admin/users');
    return response.data;
  }
);

export const fetchActiveUsers = createAsyncThunk(
  'users/fetchActiveUsers',
  async () => {
    const response = await axios.get('/admin/active-users');
    return response.data;
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ id, status }: { id: string; status: 'active' | 'suspended' }) => {
    const response = await axios.put(`/admin/users/${id}/status`, { status });
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string) => {
    await axios.delete(`/admin/users/${id}`);
    return id;
  }
);

export const updateKycStatus = createAsyncThunk(
  'users/updateKycStatus',
  async ({ id, status, remarks }: { id: string; status: 'verified' | 'rejected'; remarks?: string }) => {
    const response = await axios.put(`/admin/users/${id}/kyc`, { status, remarks });
    return response.data;
  }
);

export const uploadKycDocument = createAsyncThunk(
  'users/uploadKycDocument',
  async ({ id, type, file }: { id: string; type: 'idProof' | 'addressProof' | 'incomeProof'; file: File }) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    
    const response = await axios.post(`/admin/users/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const updateUserPermissions = createAsyncThunk(
  'users/updatePermissions',
  async ({ id, permissions }: { id: string; permissions: string[] }) => {
    const response = await axios.put(`/admin/users/${id}/permissions`, { permissions });
    return response.data;
  }
);

export const fetchUserDetails = createAsyncThunk(
  'users/fetchUserDetails',
  async (id: string) => {
    const response = await axios.get(`/admin/users/${id}`);
    return response.data;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Fetch Active Users
      .addCase(fetchActiveUsers.fulfilled, (state, action) => {
        state.activeUsers = action.payload;
      })
      // Update User Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter(user => user._id !== action.payload);
      })
      // Update KYC Status
      .addCase(updateKycStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload
          };
        }
      })
      // Upload KYC Document
      .addCase(uploadKycDocument.fulfilled, (state, action) => {
        const index = state.items.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            kycDocuments: {
              ...state.items[index].kycDocuments,
              ...action.payload.kycDocuments
            }
          };
        }
      })
      // Update User Permissions
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        const index = state.items.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            permissions: action.payload.permissions
          };
        }
      })
      // Fetch User Details
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        const index = state.items.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      });
  },
});

export const { resetError } = usersSlice.actions;
export default usersSlice.reducer;