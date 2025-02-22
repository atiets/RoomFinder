// notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [], // Initialize as an empty array
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState, // Set initialState here
  reducers: {
    getNotificationsStart: (state) => {
      state.loading = true;
    },
    getNotificationsSuccess: (state, action) => {
      state.notifications = action.payload;
      state.loading = false;
    },
    getNotificationsFailed: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    markAsReadStart: (state) => {
      state.loading = true;
    },
    markAsReadSuccess: (state, action) => {
      const notificationIndex = state.notifications.findIndex(
        (notification) => notification.id === action.payload,
      );
      if (notificationIndex !== -1) {
        state.notifications[notificationIndex].isRead = true;
      }
      state.loading = false;
    },
    markAsReadFailed: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  getNotificationsStart,
  getNotificationsSuccess,
  getNotificationsFailed,
  markAsReadStart,
  markAsReadSuccess,
  markAsReadFailed,
} = notificationSlice.actions;

export default notificationSlice.reducer;
