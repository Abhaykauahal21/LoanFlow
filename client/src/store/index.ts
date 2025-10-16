import { configureStore } from '@reduxjs/toolkit';
import notificationsReducer from './slices/notificationsSlice';
import loansReducer from './slices/loansSlice';
import usersReducer from './slices/usersSlice';
import paymentsReducer from './slices/paymentsSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    loans: loansReducer,
    users: usersReducer,
    payments: paymentsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;