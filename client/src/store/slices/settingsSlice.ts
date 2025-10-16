import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  dateFormat: string;
  currencyFormat: string;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  theme: 'light',
  sidebarCollapsed: false,
  dateFormat: 'MM/DD/YYYY',
  currencyFormat: 'USD',
  notificationsEnabled: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    updateDateFormat: (state, action: PayloadAction<string>) => {
      state.dateFormat = action.payload;
    },
    updateCurrencyFormat: (state, action: PayloadAction<string>) => {
      state.currencyFormat = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  updateDateFormat,
  updateCurrencyFormat,
  toggleNotifications,
} = settingsSlice.actions;

export default settingsSlice.reducer;