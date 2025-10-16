import React, { useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../store/slices/notificationsSlice';

const NotificationManager = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.items);

  // Track already shown notifications to prevent duplicates
  const shownNotifications = useRef(new Set());

  useEffect(() => {
    notifications.forEach((notification) => {
      const { id, type, message } = notification;

      if (shownNotifications.current.has(id)) return;

      shownNotifications.current.add(id);

      toast[type](message, {
        id,
        duration: 3000,
      });

      // Automatically remove notification from Redux after toast duration
      setTimeout(() => {
        dispatch(removeNotification(id));
        shownNotifications.current.delete(id);
      }, 3200);
    });
  }, [notifications, dispatch]);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'rounded-xl border shadow-lg',
        style: {
          background: '#fff',
          color: '#363636',
        },
        success: {
          iconTheme: {
            primary: '#16a34a',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default NotificationManager;
